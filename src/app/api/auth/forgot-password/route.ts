import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/token-utils';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('Forgot password endpoint called');
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Correo electrónico es requerido' },
        { status: 400 }
      );
    }

    console.log('Email received:', email);
    console.log('SMTP_EMAIL configured:', !!process.env.SMTP_EMAIL);
    console.log('SMTP_PASSWORD configured:', !!process.env.SMTP_PASSWORD);

    // Conectar a MongoDB solo si no hay conexión activa
    const connectionUri = process.env.MONGODB_URI || '';
    try {
      if (mongoose.connection.readyState !== 1) {
        await import('@/lib/mongodb').then(mod => mod.dbConnect(connectionUri));
      }
      // Usar la base Restaurant explícitamente
      const db = mongoose.connection.useDb('Restaurant');
      const UserRestaurant = db.model('User', User.schema);

      // Buscar el usuario por email
      const user = await UserRestaurant.findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { error: 'No existe una cuenta con este correo electrónico' },
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

      // Verificar restricciones de tiempo
      const now = new Date();
      const lastAttempt = user.lastResetPasswordAttempt;
      const attempts = user.resetPasswordAttempts || 0;

      if (lastAttempt) {
      let lastAttemptDate: Date;
      if (lastAttempt instanceof Date) {
        lastAttemptDate = lastAttempt;
      } else if (typeof lastAttempt === 'string' || typeof lastAttempt === 'number') {
        lastAttemptDate = new Date(lastAttempt);
      } else {
        lastAttemptDate = now;
      }
      const timeSinceLastAttempt = now.getTime() - lastAttemptDate.getTime();
      const minutesSinceLastAttempt = timeSinceLastAttempt / (1000 * 60);

      let requiredWaitTime = 0;
      if (typeof attempts === 'number' && attempts === 1) {
        requiredWaitTime = 1; // 1 minuto
      } else if (typeof attempts === 'number' && attempts === 2) {
        requiredWaitTime = 5; // 5 minutos
      } else if (typeof attempts === 'number' && attempts === 3) {
        requiredWaitTime = 10; // 10 minutos
      } else if (typeof attempts === 'number' && attempts >= 4) {
        requiredWaitTime = 60; // 60 minutos
      }

      if (minutesSinceLastAttempt < requiredWaitTime) {
        const remainingMinutes = Math.ceil(requiredWaitTime - minutesSinceLastAttempt);
        return NextResponse.json(
          { 
            error: `Debes esperar ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''} antes de solicitar otro código`,
            remainingTime: remainingMinutes * 60 // segundos restantes
          },
          { status: 429 }
        );
      }
      }

      // Generar token de reset
      const resetToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 110000); // 110 segundos

      // Hashear el token
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(resetToken, salt);

      // Actualizar usuario con el token y contadores
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = tokenExpires;
      user.resetPasswordAttempts = (typeof attempts === 'number' ? attempts : 0) + 1;
      user.lastResetPasswordAttempt = now;

      await user.save();

      // Enviar email con el token
      try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
          throw new Error('SMTP configuration missing');
        }
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        const mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: email,
          subject: 'Recuperación de Contraseña - Sistema de Restaurante',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Recuperación de Contraseña</h2>
              <p>Hola <strong>${user.name}</strong>,</p>
              <p>Has solicitado recuperar tu contraseña. Usa el siguiente código para continuar:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 10px 0;">Tu código de verificación es:</h3>
                <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace;">
                  ${resetToken}
                </div>
                <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                  Este código expira en 110 segundos
                </p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Si no solicitaste esta recuperación, puedes ignorar este email.
              </p>
            </div>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        return NextResponse.json(
          { error: `Error al enviar el email: ${emailError instanceof Error ? emailError.message : 'Error desconocido'}. Por favor, intenta de nuevo.` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Código de verificación enviado',
      });
    } catch (connectionError: unknown) {
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      return NextResponse.json(
        { error: `Error de conexión: ${errorMessage}` },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 