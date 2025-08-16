import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log('🔐 [VERIFY RESET CODE] Request received:', {
      email: email ? '***' : 'No email',
      code: code ? '***' : 'No code',
    });

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email y código son requeridos' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ [VERIFY RESET CODE] User not found:', email);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [VERIFY RESET CODE] User found:', {
      userId: user._id,
      email: user.email,
      hasResetToken: !!user.resetPasswordToken,
      hasResetExpires: !!user.resetPasswordExpires,
    });

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'La cuenta ha sido desactivada' },
        { status: 401 }
      );
    }

    // Verificar que el token no haya expirado
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      console.log('❌ [VERIFY RESET CODE] Token expired:', {
        hasExpires: !!user.resetPasswordExpires,
        expires: user.resetPasswordExpires,
        now: new Date(),
      });
      return NextResponse.json(
        {
          error:
            'El código de recuperación ha expirado. Por favor, solicita un nuevo código.',
        },
        { status: 400 }
      );
    }

    // Verificar que el token coincida usando bcrypt.compare directamente
    console.log('🔐 [VERIFY RESET CODE] Comparing tokens...');
    const isTokenValid = await bcrypt.compare(code, user.resetPasswordToken);
    console.log(
      '🔐 [VERIFY RESET CODE] Token comparison result:',
      isTokenValid
    );

    if (!isTokenValid) {
      return NextResponse.json(
        {
          error:
            'Código de verificación incorrecto. Por favor, verifica el código e intenta de nuevo.',
        },
        { status: 400 }
      );
    }

    console.log(
      '✅ [VERIFY RESET CODE] Code verified successfully for user:',
      user.email
    );

    // Crear respuesta exitosa con cookies
    const response = NextResponse.json({
      success: true,
      message: 'Código verificado correctamente',
    });

    // Establecer cookies para el proceso de reset (sin path restrictivo)
    console.log('🍪 [VERIFY RESET CODE] Setting cookies...');
    response.cookies.set('reset-token', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60, // 2 minutos
    });

    response.cookies.set('reset-user-id', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60, // 2 minutos
    });

    console.log('🍪 [VERIFY RESET CODE] Cookies set successfully');

    return response;
  } catch (error) {
    console.error('💥 [VERIFY RESET CODE] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
