import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';
import { generateVerificationToken } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, mongodb, smtp } = await request.json();

    // Validar datos requeridos
    if (!name || !email || !password || !mongodb?.uri || !smtp?.email || !smtp?.password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Crear contenido del archivo .env.local
    // Asegurar que la URI incluya el nombre de la base de datos "Restaurant"
    const finalMongoUri = ensureRestaurantDatabase(mongodb.uri);

    const envContent = `# Configuración de Base de Datos
MONGODB_URI=${finalMongoUri}

# Configuración de Email SMTP
SMTP_EMAIL=${smtp.email}
SMTP_PASSWORD=${smtp.password}

# Configuración de la Aplicación
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=http://localhost:3000
`;

    // Guardar archivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    // Conectar a MongoDB con la nueva URI
    try {
      const connectionUri = ensureRestaurantDatabase(mongodb.uri);
      
      await mongoose.connect(connectionUri, {
        bufferCommands: false,
      });

      // Verificar que la conexión esté activa
      const db = mongoose.connection;
      if (db.readyState !== 1) {
        throw new Error('Conexión no establecida');
      }

      // Verificar si ya existe un usuario admin
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'Ya existe un usuario administrador' },
          { status: 400 }
        );
      }

      // Verificar si el email ya está en uso
      const existingUserWithEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserWithEmail) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'Ya existe un usuario con este correo electrónico' },
          { status: 400 }
        );
      }

      // Verificar si el nombre de usuario ya está en uso
      const existingUserWithName = await User.findOne({ name: name });
      if (existingUserWithName) {
        await mongoose.disconnect();
        return NextResponse.json(
          { error: 'Ya existe un usuario con este nombre' },
          { status: 400 }
        );
      }

      // Generar token de verificación
      const verificationToken = generateVerificationToken();
      const tokenExpires = new Date(Date.now() + 110000); // 110 segundos

      // Hashear el token antes de guardarlo
      const salt = await bcrypt.genSalt(10);
      const hashedToken = await bcrypt.hash(verificationToken, salt);

      // Crear el usuario administrador con verificación pendiente
      const adminUser = new User({
        name,
        email,
        password,
        role: 'admin',
        isActive: false, // No activo hasta verificar email
        emailVerified: false,
        verificationToken: hashedToken, // Guardar el hash
        tokenExpires,
      });

      await adminUser.save();

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
        subject: 'Verificación de Email - Sistema de Restaurante',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">Verificación de Email</h2>
            <p>Hola <strong>${name}</strong>,</p>
            <p>Tu cuenta de administrador ha sido creada exitosamente. Para completar la configuración, necesitas verificar tu email.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 10px 0;">Tu código de verificación es:</h3>
              <div style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: monospace;">
                ${verificationToken}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                Este código expira en 110 segundos
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Si no solicitaste esta verificación, puedes ignorar este email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      await mongoose.disconnect();

      return NextResponse.json({
        success: true,
        message: 'Usuario administrador creado. Se ha enviado un token de verificación a tu email.',
        user: {
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        }
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
    console.error('Error creating admin user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario administrador';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

 