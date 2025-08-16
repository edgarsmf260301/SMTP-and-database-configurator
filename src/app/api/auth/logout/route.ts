import { NextRequest, NextResponse } from 'next/server';
import { deviceSessionManager } from '@/lib/device-session-manager';
import { logger, maskId } from '@/lib/logger';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/token-utils';

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    const sessionId = request.cookies.get('session-id')?.value;

    let userId: string | null = null;

    // Si hay token, obtener el userId para limpiar todas las sesiones del usuario
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, getJWTSecret()) as {
          userId: string;
          email: string;
          roles: string[];
        };
        userId = decoded.userId;

        // Limpiar TODAS las sesiones del usuario (no solo la actual)
        const userSessions = deviceSessionManager.getSessionsByUser(userId);
        let closedCount = 0;

        for (const session of userSessions) {
          const closed = deviceSessionManager.closeDeviceSessionById(
            session.sessionId
          );
          if (closed) closedCount++;
        }

        logger.info('Logout - all user sessions closed', {
          userId: maskId(userId),
          closedCount,
          totalSessions: userSessions.length,
        });
      } catch (error) {
        logger.warn('Logout - invalid token, closing only current session', {
          error,
        });
      }
    }

    // También cerrar la sesión actual por sessionId como respaldo
    if (sessionId) {
      const closed = deviceSessionManager.closeDeviceSessionById(sessionId);
      if (closed) {
        logger.info('Logout current session closed', {
          sessionId: maskId(sessionId),
        });
      }
    }

    // Crear respuesta con cookies limpias
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });

    // Limpiar cookies
    response.cookies.set('auth-token', '', {
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });
    response.cookies.set('session-id', '', {
      maxAge: 0,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Logout error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
