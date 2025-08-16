import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/lib/token-utils';
import { apiSessionCleanupManager } from '@/lib/api-session-cleanup';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    // Obtener cookies de la request
    const authToken = request.cookies.get('auth-token')?.value;
    const sessionId = request.cookies.get('session-id')?.value;

    if (!authToken || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No hay sesión activa',
        },
        { status: 401 }
      );
    }

    // Verificar JWT
    let decoded: {
      userId: string;
      email: string;
      roles: string[];
      name?: string;
    };
    try {
      decoded = jwt.verify(authToken, getJWTSecret()) as {
        userId: string;
        email: string;
        roles: string[];
        name?: string;
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
          error: 'Acceso denegado',
        },
        { status: 403 }
      );
    }

    // Obtener parámetros del body
    const { userId, action } = await request.json();

    let result: {
      action: string;
      userId?: string;
      cleanedCount?: number;
      message: string;
    } = { action: '', message: '' };

    if (action === 'cleanup-user' && userId) {
      // Limpiar sesiones de un usuario específico
      const cleanedCount = apiSessionCleanupManager.cleanupUserSessions(userId);
      result = {
        action: 'cleanup-user',
        userId,
        cleanedCount,
        message: `Limpiadas ${cleanedCount} sesiones del usuario ${userId}`,
      };
    } else if (action === 'force-cleanup') {
      // Forzar limpieza general
      apiSessionCleanupManager.performCleanup();
      result = {
        action: 'force-cleanup',
        message: 'Limpieza forzada ejecutada',
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Acción no válida',
        },
        { status: 400 }
      );
    }

    // Obtener estado del sistema de limpieza
    const cleanupStatus = apiSessionCleanupManager.getStatus();

    console.log(
      `🧹 [FORCE CLEANUP] Admin ${decoded.name} ejecutó acción: ${action}`
    );

    return NextResponse.json({
      success: true,
      message: 'Limpieza ejecutada exitosamente',
      result,
      cleanupStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('💥 [FORCE CLEANUP] Error durante limpieza:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
