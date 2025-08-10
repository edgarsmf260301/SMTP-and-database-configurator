import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { generateJWTToken } from '@/lib/token-utils';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nombre de usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB solo si no hay conexión activa
    const connectionUri = process.env.MONGODB_URI || '';
    try {
      if (mongoose.connection.readyState !== 1) {
        await import('@/lib/mongodb').then(mod => mod.dbConnect(connectionUri));
      }
      // Usar la base Restaurant explícitamente
      const db = mongoose.connection.useDb('Restaurant');
      const UserRestaurant = db.model('User', User.schema);

      // Buscar el usuario por nombre de usuario
      const user = await UserRestaurant.findOne({ name: username });

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
      const isPasswordValid = typeof user.comparePassword === 'function' ? await user.comparePassword(password) : false;

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }

      // Generar token JWT con roles
      const token = generateJWTToken(
        {
          userId: user._id,
          email: user.email,
          roles: user.roles,
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
          roles: user.roles,
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
    } catch (connectionError: unknown) {
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      return NextResponse.json(
        { error: `Error de conexión: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 