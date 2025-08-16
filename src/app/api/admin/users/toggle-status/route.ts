import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { verifyJWTToken } from '@/lib/token-utils';
import { apiSessionCleanupManager } from '@/lib/api-session-cleanup';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del admin
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

    // Verificar JWT
    let decoded: { userId: string; email: string; roles: string[] };
    try {
      decoded = jwt.verify(authToken, getJWTSecret()) as {
        userId: string;
        email: string;
        roles: string[];
      };
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido',
        },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (!decoded.roles || !decoded.roles.includes('admin')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Acceso denegado. Solo administradores pueden realizar esta acción.',
        },
        { status: 403 }
      );
    }

    // Obtener datos de la request
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de usuario y acción son requeridos',
        },
        { status: 400 }
      );
    }

    if (!['enable', 'disable'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acción inválida. Debe ser "enable" o "disable"',
        },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    if (mongoose.connection.readyState !== 1) {
      await import('@/lib/mongodb').then(mod => mod.default());
    }

    const db = mongoose.connection.useDb('Restaurant');
    const UserRestaurant = db.model('User', User.schema);

    // Buscar el usuario
    const user = await UserRestaurant.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      );
    }

    // No permitir deshabilitar al propio admin
    if (userId === decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No puedes deshabilitar tu propia cuenta',
        },
        { status: 400 }
      );
    }

    // Aplicar la acción
    const newStatus = action === 'enable';
    user.isActive = newStatus;

    // Agregar timestamp de la acción
    user.statusChangedAt = new Date();
    user.statusChangedBy = decoded.userId;

    await user.save();

    console.log(
      `👤 [ADMIN] Usuario ${action === 'enable' ? 'habilitado' : 'deshabilitado'}: ${user.name} (${user.email}) por admin: ${decoded.name}`
    );

    // Si se deshabilita, forzar cierre de todas las sesiones del usuario como medida de emergencia
    if (action === 'disable') {
      // Limpiar sesiones del API session cleanup manager
      apiSessionCleanupManager.cleanupUserSessions(userId);

      // También limpiar sesiones del device session manager
      const userSessions = deviceSessionManager.getSessionsByUser(userId);
      let closedCount = 0;

      for (const session of userSessions) {
        const closed = deviceSessionManager.closeDeviceSessionById(
          session.sessionId
        );
        if (closed) closedCount++;
      }

      logger.info('User disabled - all sessions cleaned', {
        userId: maskId(userId),
        closedCount,
        totalSessions: userSessions.length,
        reason: 'user_disabled',
      });
    }

    // DESPUÉS de cambiar el estado del usuario, verificar el estado del usuario actual
    const currentUser = await UserRestaurant.findById(decoded.userId).select(
      '-password'
    );

    if (!currentUser || !currentUser.isActive) {
      console.log(
        `❌ [ADMIN] Usuario actual ${decoded.name} ha sido deshabilitado, debe cerrar sesión`
      );

      return NextResponse.json({
        success: true,
        message: `Usuario ${action === 'enable' ? 'habilitado' : 'deshabilitado'} exitosamente`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          statusChangedAt: user.statusChangedAt,
        },
        currentUserStatus: {
          isActive: false,
          action: 'logout_required',
        },
      });
    }

    // Si se deshabilitó, agregar información para notificar al usuario
    const responseData: any = {
      success: true,
      message: `Usuario ${action === 'enable' ? 'habilitado' : 'deshabilitado'} exitosamente`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        statusChangedAt: user.statusChangedAt,
      },
      currentUserStatus: {
        isActive: true,
        action: 'continue',
      },
    };

    if (action === 'disable') {
      responseData.notification = {
        type: 'user_disabled',
        message: `El usuario ${user.name} ha sido deshabilitado`,
        userId: user._id,
        disabledAt: user.statusChangedAt,
        disabledBy: decoded.userId,
      };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
