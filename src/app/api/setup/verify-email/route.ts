import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

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

    // Conectar a MongoDB
    try {
      await mongoose.connect(mongodb.uri, {
        bufferCommands: false,
      });

      // Buscar el usuario por email
      const user = await User.findOne({ email });
      if (!user) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      // Verificar si el token coincide y no ha expirado
      if (user.verificationToken !== token) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'Token de verificación inválido' },
          { status: 400 }
        );
      }

      if (user.tokenExpires && new Date() > user.tokenExpires) {
        await mongoose.disconnect();
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

      await mongoose.disconnect();

      return NextResponse.json({
        success: true,
        message: 'Email verificado exitosamente. Tu cuenta de administrador está ahora activa.',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } catch (connectionError: unknown) {
      await mongoose.disconnect();
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      throw new Error(`Error de conexión: ${errorMessage}`);
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