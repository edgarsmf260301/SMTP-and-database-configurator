import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { deviceSessionManager } from '@/lib/device-session-manager';
import { logger, maskId } from '@/lib/logger';
import { getJWTSecret } from '@/lib/token-utils';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    const sessionId = request.cookies.get('session-id')?.value;

    if (!authToken || !sessionId) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Token de autenticación o ID de sesión no encontrado',
        },
        { status: 401 }
      );
    }

    // Verificar JWT
    let decoded: {
      userId: string;
      email: string;
      roles: string[];
      exp: number;
    };
    try {
      decoded = jwt.verify(authToken, getJWTSecret()) as {
        userId: string;
        email: string;
        roles: string[];
        exp: number;
      };
    } catch (error) {
      logger.warn('Invalid JWT token', { error });
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Token inválido',
        },
        { status: 401 }
      );
    }

    // Verificar que el session-id contenga el userId del token
    // El formato es: userId_timestamp_random
    if (!sessionId.startsWith(decoded.userId + '_')) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Sesión inválida',
        },
        { status: 401 }
      );
    }

    // Conectar a la base de datos
    await connectToDatabase();

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Usuario no encontrado',
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      logger.info('User disabled, logging out', {
        userId: maskId(user._id.toString()),
      });
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Usuario deshabilitado',
        },
        { status: 401 }
      );
    }

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Email no verificado',
        },
        { status: 401 }
      );
    }

    // Actualizar actividad de la sesión por sessionId
    const activityUpdated =
      deviceSessionManager.updateSessionActivityById(sessionId);
    if (!activityUpdated) {
      logger.warn('Session activity update failed', {
        sessionId: maskId(sessionId),
        userId: maskId(user._id.toString()),
      });
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Sesión expirada',
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario tiene sesión activa en otro dispositivo
    const isLoggedInElsewhere = deviceSessionManager.isUserLoggedInElsewhere(
      user._id.toString(),
      sessionId
    );
    if (isLoggedInElsewhere) {
      logger.info('User logged in elsewhere, but allowing current session', {
        userId: maskId(user._id.toString()),
        sessionId: maskId(sessionId),
      });
      // No bloquear la sesión actual, solo registrar la información
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    logger.error('Check session error', error);
    return NextResponse.json(
      {
        authenticated: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
