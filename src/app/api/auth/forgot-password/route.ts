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

    // Conectar a MongoDB
    const connectionUri = ensureRestaurantDatabase(process.env.MONGODB_URI || '');
    
    try {
      await mongoose.connect(connectionUri, {
        bufferCommands: false,
      });

      // Verificar que la conexión esté activa
      const db = mongoose.connection;
      if (db.readyState !== 1) {
        throw new Error('Conexión no establecida');
      }

      // Buscar el usuario por email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'No existe una cuenta con este correo electrónico' },
          { status: 404 }
        );
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        await mongoose.disconnect();
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
      const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime();
      const minutesSinceLastAttempt = timeSinceLastAttempt / (1000 * 60);

      let requiredWaitTime = 0;
      if (attempts === 1) {
        requiredWaitTime = 1; // 1 minuto
      } else if (attempts === 2) {
        requiredWaitTime = 5; // 5 minutos
      } else if (attempts === 3) {
        requiredWaitTime = 10; // 10 minutos
      } else if (attempts >= 4) {
        requiredWaitTime = 60; // 60 minutos
      }

      if (minutesSinceLastAttempt < requiredWaitTime) {
        await mongoose.disconnect();
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
    user.resetPasswordAttempts = attempts + 1;
    user.lastResetPasswordAttempt = now;

      await user.save();

             // Enviar email con el token
                         try {
           console.log('Creating nodemailer transporter...');
           
           // Verificar que las variables de entorno estén configuradas
           if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
             throw new Error('SMTP configuration missing');
           }
           
           // Verificar que nodemailer esté disponible
           if (typeof nodemailer === 'undefined') {
             throw new Error('Nodemailer not available');
           }
           
           console.log('Nodemailer available, creating transporter...');
           
           const transporter = nodemailer.createTransport({
             host: 'smtp.gmail.com',
             port: 587,
             secure: false, // true for 465, false for other ports
             auth: {
               user: process.env.SMTP_EMAIL,
               pass: process.env.SMTP_PASSWORD,
             },
           });

           console.log('Transporter created, preparing mail options...');

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

            console.log('Sending email...');
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
                } catch (emailError) {
           console.error('Error enviando email:', emailError);
           // Si falla el envío de email, aún así guardamos el token para que el usuario pueda intentar de nuevo
           // pero informamos del error
           await mongoose.disconnect();
           return NextResponse.json(
             { error: `Error al enviar el email: ${emailError instanceof Error ? emailError.message : 'Error desconocido'}. Por favor, intenta de nuevo.` },
             { status: 500 }
           );
         }

      await mongoose.disconnect();

             return NextResponse.json({
         success: true,
         message: 'Código de verificación enviado',
       });
    } catch (connectionError: unknown) {
      console.error('Error de conexión a MongoDB:', connectionError);
      await mongoose.disconnect();
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