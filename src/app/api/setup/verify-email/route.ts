import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Obtener token de verificación de las cookies
    const verificationToken = request.cookies.get('verification-token')?.value;
    const verificationUserId = request.cookies.get(
      'verification-user-id'
    )?.value;

    if (!verificationToken || !verificationUserId) {
      return NextResponse.json(
        { error: 'Token de verificación no encontrado' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    const connectionUri = process.env.MONGODB_URI || '';
    if (mongoose.connection.readyState !== 1) {
      await import('@/lib/mongodb').then(mod => mod.dbConnect(connectionUri));
    }

    // Usar la base Restaurant explícitamente
    const db = mongoose.connection.useDb('Restaurant');
    const UserRestaurant = db.model('User', User.schema);

    // Buscar el usuario
    const user = await UserRestaurant.findById(verificationUserId);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el email coincida
    if (user.email !== email) {
      return NextResponse.json(
        { error: 'Email no coincide con el usuario' },
        { status: 400 }
      );
    }

    // Verificar que el token no haya expirado
    if (!user.tokenExpires || new Date() > user.tokenExpires) {
      return NextResponse.json(
        { error: 'El token de verificación ha expirado' },
        { status: 400 }
      );
    }

    // Verificar que el token coincida
    const isTokenValid = await user.compareVerificationToken(verificationToken);
    if (!isTokenValid) {
      return NextResponse.json(
        { error: 'Token de verificación inválido' },
        { status: 400 }
      );
    }

    // Marcar email como verificado
    await UserRestaurant.findByIdAndUpdate(user._id, {
      emailVerified: true,
      verificationToken: undefined,
      tokenExpires: undefined,
    });

    // Crear archivo .env.local con la configuración
    const envContent = `MONGODB_URI=${process.env.MONGODB_URI}
SMTP_EMAIL=${process.env.SMTP_EMAIL}
SMTP_PASSWORD=${process.env.SMTP_PASSWORD}
NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET}`;

    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
    });

    // Limpiar cookies de verificación
    response.cookies.set('verification-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set('verification-user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
