import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/lib/token-utils';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del usuario actual
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
        },
        { status: 401 }
      );
    }

    // Verificar token JWT
    const decoded = verifyJWTToken(
      authToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido',
        },
        { status: 401 }
      );
    }

    // Conectar a MongoDB si es necesario
    if (mongoose.connection.readyState !== 1) {
      await import('@/lib/mongodb').then(mod => mod.default());
    }

    const db = mongoose.connection.useDb('Restaurant');
    const UserRestaurant = db.model('User', User.schema);

    // Buscar el usuario actual en la base de datos
    const currentUser = await UserRestaurant.findById(decoded.userId).select(
      '-password'
    );

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // Verificar que el usuario esté activo
    if (!currentUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario desactivado',
          action: 'logout',
        },
        { status: 401 }
      );
    }

    // Verificar que el email esté verificado
    if (!currentUser.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email no verificado',
        },
        { status: 401 }
      );
    }

    console.log(
      `✅ [VERIFY CURRENT] Usuario ${currentUser.name} verificado como activo`
    );

    return NextResponse.json({
      success: true,
      message: 'Usuario verificado exitosamente',
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        isActive: currentUser.isActive,
        roles: currentUser.roles,
      },
    });
  } catch (error) {
    console.error('Error verifying current user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
