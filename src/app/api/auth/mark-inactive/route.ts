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

    // Marcar inactivo por sessionId
    const updated =
      deviceSessionManager.markDeviceInactiveBySessionId(sessionId);

    if (updated) {
      logger.info('Session marked as inactive', {
        sessionId: maskId(sessionId),
      });
      return NextResponse.json({ success: true });
    } else {
      logger.warn('Session not found for mark inactive', {
        sessionId: maskId(sessionId),
      });
      return NextResponse.json({ success: false, error: 'Session not found' });
    }
  } catch (error) {
    logger.error('Mark inactive error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
