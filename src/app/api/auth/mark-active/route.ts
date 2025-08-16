import { NextRequest, NextResponse } from 'next/server';
import { deviceSessionManager } from '@/lib/device-session-manager';
import { logger, maskId } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session-id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session ID found',
        },
        { status: 400 }
      );
    }

    // Actualizar actividad por sessionId
    const updated = deviceSessionManager.updateSessionActivityById(sessionId);

    if (updated) {
      logger.info('Session marked as active', { sessionId: maskId(sessionId) });
      return NextResponse.json({ success: true });
    } else {
      logger.warn('Session not found for mark active', {
        sessionId: maskId(sessionId),
      });
      return NextResponse.json({ success: false, error: 'Session not found' });
    }
  } catch (error) {
    logger.error('Mark active error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
