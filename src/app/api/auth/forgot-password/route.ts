import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/token-utils';
import { sendVerificationEmail } from '@/lib/send-verification-email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB si es necesario
    if (mongoose.connection.readyState !== 1) {
      await import('@/lib/mongodb').then(mod => mod.default());
    }

    // Usar la base Restaurant explícitamente
    const db = mongoose.connection.useDb('Restaurant');
    const UserRestaurant = db.model('User', User.schema);

    // Buscar el usuario por email
    const user = await UserRestaurant.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return NextResponse.json({
        success: true,
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return NextResponse.json({
        success: true,
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace de recuperación',
      });
    }

    // Generar token de recuperación
    const resetToken = generateVerificationToken();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Hashear el token antes de guardarlo
    const bcrypt = await import('bcryptjs');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Actualizar usuario con el token hasheado
    await UserRestaurant.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: resetTokenExpires,
      resetPasswordAttempts: 0,
      lastResetPasswordAttempt: new Date(),
    });

    // Enviar email con el token
    try {
      const smtp = {
        email: process.env.SMTP_EMAIL!,
        password: process.env.SMTP_PASSWORD!,
      };

      if (!smtp.email || !smtp.password) {
        throw new Error('Configuración SMTP incompleta');
      }

      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        smtp,
        code: resetToken,
        expiresInSeconds: 900, // 15 minutos
      });
    } catch (emailError) {
      console.error('Error sending reset password email:', emailError);
      return NextResponse.json(
        { error: 'Error al enviar el email de recuperación' },
        { status: 500 }
      );
    }

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message: 'Email de recuperación enviado',
    });

    // Establecer cookie con el token de recuperación (HTTPOnly, Secure)
    response.cookies.set('reset-token', resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/reset-password',
    });

    // Establecer cookie de identificación del usuario
    response.cookies.set('reset-user-id', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/reset-password',
    });

    return response;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
