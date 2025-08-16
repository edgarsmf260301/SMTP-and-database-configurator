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
    let closedCount = 0;

    // Si hay token, obtener el userId para limpiar todas las sesiones del usuario
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, getJWTSecret()) as {
          userId: string;
          email: string;
          roles: string[];
        };
        userId = decoded.userId;

        // Limpiar TODAS las sesiones del usuario
        const userSessions = deviceSessionManager.getSessionsByUser(userId);

        for (const session of userSessions) {
          const closed = deviceSessionManager.closeDeviceSessionById(
            session.sessionId
          );
          if (closed) closedCount++;
        }

        logger.info('Browser close - all user sessions cleaned', {
          userId: maskId(userId),
          closedCount,
          totalSessions: userSessions.length,
          reason: 'browser_closed',
        });
      } catch (error) {
        logger.warn(
          'Browser close - invalid token, cleaning only current session',
          { error }
        );
      }
    }

    // También cerrar la sesión actual por sessionId como respaldo
    if (sessionId) {
      const closed = deviceSessionManager.closeDeviceSessionById(sessionId);
      if (closed) {
        closedCount++;
        logger.info('Browser close - current session cleaned', {
          sessionId: maskId(sessionId),
          reason: 'browser_closed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sesiones limpiadas por cierre de navegador',
      closedCount,
      userId: userId ? maskId(userId) : null,
    });
  } catch (error) {
    logger.error('Browser close error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar sesiones',
      },
      { status: 500 }
    );
  }
}
