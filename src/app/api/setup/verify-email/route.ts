import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '../../../../lib/mongodb';
import User from '@/models/User';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';
import { compareVerificationToken } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, token, mongodb } = await request.json();

    // Validar datos requeridos
    if (!email || !token || !mongodb?.uri) {
      return NextResponse.json(
        { error: 'Email, token y configuración de MongoDB son requeridos' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB solo si no hay conexión activa
    try {
      let connectionUri = mongodb.uri;
      // Solo conectar si no hay conexión activa
      if (mongoose.connection.readyState !== 1) {
        await dbConnect(connectionUri);
      }
      // Usar la base Restaurant explícitamente
      const db = mongoose.connection.useDb('Restaurant');
      // Usar el modelo User en la base Restaurant
      const UserRestaurant = db.model('User', User.schema);

      // Buscar el usuario por email
      const user = await UserRestaurant.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      // Verificar si el token coincide y no ha expirado
      let isTokenValid = false;
      try {
        isTokenValid = await compareVerificationToken(token, typeof user.verificationToken === 'string' ? user.verificationToken : '');
        console.log('Verificación de token completada:', isTokenValid);
      } catch (error) {
        console.error('Error al verificar token:', error);
        isTokenValid = false;
      }

      if (!isTokenValid) {
        return NextResponse.json(
          { error: 'Token de verificación inválido' },
          { status: 400 }
        );
      }

      if (user.tokenExpires && new Date() > user.tokenExpires) {
        return NextResponse.json(
          { error: 'Token de verificación expirado' },
          { status: 400 }
        );
      }

      // Verificar el email y activar el usuario
      user.emailVerified = true;
      user.isActive = true;
      user.verificationToken = undefined;
      user.tokenExpires = undefined;
      await user.save();

      // No desconectar mongoose, para evitar problemas de reconexión

      return NextResponse.json({
        success: true,
        message: 'Email verificado exitosamente. Tu cuenta de administrador está ahora activa.',
        user: {
          name: user.name,
          email: user.email,
          roles: user.roles,
        }
      });
    } catch (connectionError: unknown) {
      console.error('Error de conexión a MongoDB:', connectionError);
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      return NextResponse.json(
        { error: `Error de conexión: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error verifying email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al verificar email';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 