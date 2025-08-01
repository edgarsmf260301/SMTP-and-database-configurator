import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateJWTToken } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nombre de usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar el usuario por nombre de usuario
    const user = await User.findOne({ name: username });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido desactivada' },
        { status: 401 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generateJWTToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      '24h'
    );

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    // Establecer cookie con el token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 