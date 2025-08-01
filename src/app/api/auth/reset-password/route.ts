import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { compareVerificationToken } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar el usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta ha sido desactivada' },
        { status: 401 }
      );
    }

    // Verificar si el token coincide y no ha expirado
    const isTokenValid = await compareVerificationToken(token, user.resetPasswordToken || '');
    
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Código de verificación inválido' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { error: 'Código de verificación expirado' },
        { status: 400 }
      );
    }

    // Cambiar la contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    user.lastResetPasswordAttempt = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Contraseña cambiada exitosamente. Serás redirigido al login.',
    });

  } catch (error: unknown) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 