import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña de aplicación son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Verificar que sea un email de Gmail
    if (!email.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Solo se permiten emails de Gmail' },
        { status: 400 }
      );
    }

    // Crear transportador de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    // Verificar la conexión
    try {
      await transporter.verify();
      
      return NextResponse.json({
        success: true,
        message: 'Configuración SMTP verificada correctamente'
      });
    } catch (verifyError: unknown) {
      const errorMessage = verifyError instanceof Error ? verifyError.message : 'Error de verificación desconocido';
      throw new Error(`Error de verificación SMTP: ${errorMessage}`);
    }
  } catch (error: unknown) {
    console.error('Error testing SMTP configuration:', error);
    
    // Mensajes de error más específicos
    let errorMessage = 'Error al verificar configuración SMTP';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Credenciales de Gmail inválidas. Verifica tu email y contraseña de aplicación.';
      } else if (error.message.includes('Less secure app access')) {
        errorMessage = 'Debes habilitar el acceso de aplicaciones menos seguras en tu cuenta de Google.';
      } else if (error.message.includes('2FA')) {
        errorMessage = 'Debes generar una contraseña de aplicación si tienes verificación en dos pasos activada.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 