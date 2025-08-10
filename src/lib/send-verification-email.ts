import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { generateVerificationToken } from './token-utils';

export interface SendVerificationEmailOptions {
  email: string;
  name: string;
  smtp: {
    email: string;
    password: string;
  };
  code?: string; // Optional: allow passing a code for resend
  expiresInSeconds?: number; // Optional: default 110
}

export async function sendVerificationEmail({ email, name, smtp, code, expiresInSeconds = 110 }: SendVerificationEmailOptions) {
  // Generate code if not provided
  const verificationToken = code || generateVerificationToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtp.email,
      pass: smtp.password,
    },
  });
  await transporter.sendMail({
    from: smtp.email,
    to: email,
    subject: 'Verificación de Email - Sistema de Restaurante',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Verificación de Email</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu cuenta ha sido creada exitosamente. Para completar la configuración, necesitas verificar tu email.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 10px 0;">Tu código de verificación es:</h3>
          <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace;">
            ${verificationToken}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
            Este código expira en ${expiresInSeconds} segundos
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Si no solicitaste esta verificación, puedes ignorar este email.
        </p>
      </div>
    `,
  });
  // Return the code and its hash for storage
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(verificationToken, salt);
  return { code: verificationToken, hashedToken };
}
