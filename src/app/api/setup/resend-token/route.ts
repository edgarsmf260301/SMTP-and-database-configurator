import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';
import { generateVerificationToken } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, mongodb, smtp } = await request.json();

    // Validar datos requeridos
    if (!email || !mongodb?.uri || !smtp?.email || !smtp?.password) {
      return NextResponse.json(
        { error: 'Email y configuración de MongoDB/SMTP son requeridos' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    try {
      const connectionUri = ensureRestaurantDatabase(mongodb.uri);
      
      await mongoose.connect(connectionUri, {
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

      // Verificar si el email ya está verificado
      if (user.emailVerified) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'El email ya está verificado' },
          { status: 400 }
        );
      }

      // Generar nuevo token
      const verificationToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 110000); // 110 segundos

      // Hashear el token antes de guardarlo
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(verificationToken, salt);

      // Actualizar el usuario con el nuevo token hasheado
      user.verificationToken = hashedToken;
      user.tokenExpires = tokenExpires;
      
      await user.save();

      // Enviar email de verificación
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtp.email,
          pass: smtp.password,
        },
      });

      const mailOptions = {
        from: smtp.email,
        to: email,
        subject: 'Nuevo Token de Verificación - Sistema de Restaurante',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Nuevo Token de Verificación</h2>
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Se ha generado un nuevo token de verificación para tu cuenta de administrador.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 10px 0;">Tu nuevo código de verificación es:</h3>
              <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace;">
                ${verificationToken}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                Este código expira en 110 segundos
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Si no solicitaste este nuevo token, puedes ignorar este email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      await mongoose.disconnect();

      return NextResponse.json({
        success: true,
        message: 'Código de verificación enviado',
      });
    } catch (connectionError: unknown) {
      await mongoose.disconnect();
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      throw new Error(`Error de conexión: ${errorMessage}`);
    }
  } catch (error: unknown) {
    console.error('Error resending token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al reenviar token';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

 