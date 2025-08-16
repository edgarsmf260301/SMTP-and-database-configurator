import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import rateLimiter from '@/lib/rate-limiter';
import { deviceSessionManager } from '@/lib/device-session-manager';
import { logger, maskId } from '@/lib/logger';
import { getJWTSecret } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Verificar rate limit por dispositivo
    const rateLimitCheck = rateLimiter.isBlocked(userAgent, ipAddress);
    if (rateLimitCheck.blocked) {
      logger.warn('Login blocked by rate limit', {
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        remainingTime: rateLimitCheck.remainingTime,
      });
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Intenta de nuevo en ${rateLimitCheck.remainingTime} segundos.`,
        },
        { status: 429 }
      );
    }

    // Validar campos requeridos
    if (!username || !password) {
      const rateLimitResult = rateLimiter.recordAttempt(userAgent, ipAddress);
      logger.warn('Login attempt with missing fields', {
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        attemptsLeft: rateLimitResult.attemptsLeft,
      });
      return NextResponse.json(
        {
          error: 'Nombre de usuario/email y contraseña son requeridos',
        },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Debug: Ver todos los usuarios en la base de datos
    const allUsers = await User.find(
      {},
      'name email username isActive emailVerified'
    );
    logger.info('All users in database', {
      count: allUsers.length,
      users: allUsers.map(u => ({
        id: maskId(u._id.toString()),
        name: u.name,
        email: maskId(u.email),
        username: u.username || 'N/A',
        isActive: u.isActive,
        emailVerified: u.emailVerified,
      })),
    });

    // Debug: Ver qué se está buscando
    logger.info('Login attempt', {
      searchTerm: username,
      userAgent: maskId(userAgent),
      ipAddress: maskId(ipAddress),
    });

    // Buscar usuario por name (nombre completo) o email
    let user = await User.findOne({
      name: { $regex: new RegExp(username, 'i') },
    });

    // Debug: Resultado de búsqueda por name
    if (user) {
      logger.info('User found by name', {
        userId: maskId(user._id.toString()),
        name: user.name,
        email: maskId(user.email),
      });
    } else {
      logger.info('No user found by name, trying email');
    }

    // Si no se encuentra por name, buscar por email (fallback)
    if (!user) {
      user = await User.findOne({ email: username.toLowerCase() });

      // Debug: Resultado de búsqueda por email
      if (user) {
        logger.info('User found by email', {
          userId: maskId(user._id.toString()),
          name: user.name,
          email: maskId(user.email),
        });
      } else {
        logger.info('No user found by email either');
      }
    }

    if (!user) {
      const rateLimitResult = rateLimiter.recordAttempt(userAgent, ipAddress);
      logger.warn('Login attempt with invalid name/email', {
        username: maskId(username),
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        attemptsLeft: rateLimitResult.attemptsLeft,
      });
      return NextResponse.json(
        {
          error: 'Credenciales inválidas',
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      const rateLimitResult = rateLimiter.recordAttempt(userAgent, ipAddress);
      logger.warn('Login attempt for inactive user', {
        userId: maskId(user._id.toString()),
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        attemptsLeft: rateLimitResult.attemptsLeft,
      });
      return NextResponse.json(
        {
          error: 'Tu cuenta ha sido deshabilitada. Contacta al administrador.',
        },
        { status: 403 }
      );
    }

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      const rateLimitResult = rateLimiter.recordAttempt(userAgent, ipAddress);
      logger.warn('Login attempt for unverified email', {
        userId: maskId(user._id.toString()),
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        attemptsLeft: rateLimitResult.attemptsLeft,
      });
      return NextResponse.json(
        {
          error: 'Debes verificar tu email antes de iniciar sesión',
        },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const rateLimitResult = rateLimiter.recordAttempt(userAgent, ipAddress);
      logger.warn('Login attempt with invalid password', {
        userId: maskId(user._id.toString()),
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
        attemptsLeft: rateLimitResult.attemptsLeft,
      });
      return NextResponse.json(
        {
          error: 'Credenciales inválidas',
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario ya tiene una sesión activa en otro dispositivo
    const takeoverResult = deviceSessionManager.attemptUserTakeover(
      user._id.toString(),
      userAgent,
      ipAddress
    );
    // Siempre permitir el login, solo cerrar sesiones antiguas si es necesario
    logger.info('Login takeover result', {
      userId: maskId(user._id.toString()),
      userAgent: maskId(userAgent),
      ipAddress: maskId(ipAddress),
      takeover: takeoverResult.takeover,
      closedCount: takeoverResult.closedCount,
    });

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles,
      },
      getJWTSecret(),
      { expiresIn: '2h' }
    );

    // Generar session ID único
    const sessionId = `${user._id.toString()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crear sesión de dispositivo
    const sessionCreated = deviceSessionManager.createDeviceSession(
      user._id.toString(),
      sessionId,
      userAgent,
      ipAddress
    );

    if (!sessionCreated) {
      logger.error('Failed to create device session', {
        userId: maskId(user._id.toString()),
        userAgent: maskId(userAgent),
        ipAddress: maskId(ipAddress),
      });
      return NextResponse.json(
        {
          error: 'Error al crear sesión de dispositivo',
        },
        { status: 500 }
      );
    }

    // Resetear intentos fallidos al login exitoso
    rateLimiter.resetAttempts(userAgent, ipAddress);

    // Crear respuesta con cookies
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });

    // Establecer cookies
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 horas
    });

    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 horas
    });

    logger.info('User logged in successfully', {
      userId: maskId(user._id.toString()),
      userAgent: maskId(userAgent),
      ipAddress: maskId(ipAddress),
      takeover: takeoverResult.takeover,
      closedCount: takeoverResult.closedCount,
    });

    return response;
  } catch (error) {
    logger.error('Login error', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
