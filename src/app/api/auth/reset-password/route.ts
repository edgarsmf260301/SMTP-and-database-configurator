import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Obtener tokens de las cookies
    const resetToken = request.cookies.get('reset-token')?.value;
    const resetUserId = request.cookies.get('reset-user-id')?.value;

    console.log('🔐 [RESET PASSWORD] Cookies received:', {
      hasResetToken: !!resetToken,
      hasResetUserId: !!resetUserId,
      resetToken: resetToken ? '***' : 'No token',
      resetUserId: resetUserId ? '***' : 'No user ID',
    });

    // Debug: mostrar todas las cookies
    const allCookies = request.cookies.getAll();
    console.log(
      '🍪 [RESET PASSWORD] All cookies:',
      allCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
    );

    if (!resetToken || !resetUserId) {
      return NextResponse.json(
        {
          error:
            'Token de recuperación inválido o expirado. Por favor, solicita un nuevo código.',
        },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await dbConnect();

    // Buscar el usuario
    const user = await User.findById(resetUserId);

    if (!user) {
      console.log('❌ [RESET PASSWORD] User not found:', resetUserId);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [RESET PASSWORD] User found:', {
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
      console.log('❌ [RESET PASSWORD] Token expired:', {
        hasExpires: !!user.resetPasswordExpires,
        expires: user.resetPasswordExpires,
        now: new Date(),
      });
      return NextResponse.json(
        {
          error:
            'El token de recuperación ha expirado. Por favor, solicita un nuevo código.',
        },
        { status: 400 }
      );
    }

    // Verificar que el token coincida usando bcrypt.compare directamente
    console.log('🔐 [RESET PASSWORD] Comparing tokens...');
    const isTokenValid = await bcrypt.compare(
      resetToken,
      user.resetPasswordToken
    );
    console.log('🔐 [RESET PASSWORD] Token comparison result:', isTokenValid);

    if (!isTokenValid) {
      return NextResponse.json(
        {
          error:
            'Token de recuperación inválido. Por favor, verifica el código e intenta de nuevo.',
        },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña y limpiar tokens
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      resetPasswordAttempts: 0,
      lastResetPasswordAttempt: undefined,
    });

    console.log(
      '✅ [RESET PASSWORD] Password updated successfully for user:',
      user.email
    );

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });

    // Limpiar cookies de recuperación
    console.log('🍪 [RESET PASSWORD] Clearing cookies...');
    response.cookies.set('reset-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set('reset-user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
    });

    console.log('🍪 [RESET PASSWORD] Cookies cleared successfully');

    return response;
  } catch (error) {
    console.error('💥 [RESET PASSWORD] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
