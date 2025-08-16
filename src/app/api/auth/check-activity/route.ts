import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTToken } from '@/lib/token-utils';
import { deviceSessionManager } from '@/lib/device-session-manager';
import { logger, maskId } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    const sessionId = request.cookies.get('session-id')?.value;

    if (!authToken || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(
      authToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    );
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const stats = deviceSessionManager.getStats();
    logger.debug('check-activity', maskId(decoded.userId));

    return NextResponse.json({
      success: true,
      message: 'Actividad verificada',
      timestamp: new Date().toISOString(),
      deviceStats: stats,
    });
  } catch (error) {
    logger.error('check-activity error', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
