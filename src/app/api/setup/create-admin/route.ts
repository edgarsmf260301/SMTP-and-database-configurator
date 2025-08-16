import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/token-utils';
import { sendVerificationEmail } from '@/lib/send-verification-email';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, mongodb, smtp } = await request.json();

    // Validar datos requeridos
    if (
      !name ||
      !email ||
      !password ||
      !mongodb?.uri ||
      !smtp?.email ||
      !smtp?.password
    ) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    if (mongoose.connection.readyState !== 1) {
      await import('@/lib/mongodb').then(mod => mod.dbConnect(mongodb.uri));
    }

    // Usar la base Restaurant explícitamente
    const db = mongoose.connection.useDb('Restaurant');
    const UserRestaurant = db.model('User', User.schema);

    // Verificar si ya existe un usuario con ese email
    const existingUser = await UserRestaurant.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese email' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con ese nombre
    const existingUsername = await UserRestaurant.findOne({ name });
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese nombre' },
        { status: 400 }
      );
    }

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Hashear el token antes de guardarlo
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(verificationToken, salt);

    // Crear el usuario administrador
    const adminUser = new UserRestaurant({
      name,
      email: email.toLowerCase(),
      password, // Se hasheará automáticamente por el middleware del modelo
      roles: ['admin'],
      isActive: true,
      emailVerified: false,
      verificationToken: hashedToken,
      tokenExpires,
      resetPasswordAttempts: 0,
    });

    await adminUser.save();

    // Enviar email de verificación
    try {
      // Usar los datos SMTP recibidos del formulario para el primer admin
      const smtpConfig = smtp;
      if (!smtpConfig.email || !smtpConfig.password) {
        throw new Error('Configuración SMTP incompleta');
      }
      await sendVerificationEmail({
        email: adminUser.email,
        name: adminUser.name,
        smtp: smtpConfig,
        code: verificationToken,
        expiresInSeconds: 120, // 15 minutos
      });
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Si falla el envío de email, eliminar el usuario creado
      await UserRestaurant.findByIdAndDelete(adminUser._id);
      return NextResponse.json(
        {
          error:
            'Error al enviar el email de verificación: ' +
            (emailError instanceof Error
              ? emailError.message
              : 'Error desconocido'),
        },
        { status: 500 }
      );
    }

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message:
        'Usuario administrador creado exitosamente. Revisa tu email para verificar tu cuenta.',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        roles: adminUser.roles,
      },
    });

    // Establecer cookies con tokens de verificación (HTTPOnly, Secure)
    response.cookies.set('verification-token', verificationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/',
    });

    response.cookies.set('verification-user-id', adminUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
