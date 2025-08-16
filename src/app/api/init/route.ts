import { NextResponse } from 'next/server';

// Importar sistema de inicialización del servidor
import '@/lib/api-session-cleanup';

export async function GET() {
  try {
    console.log('🚀 [API INIT] Sistema de inicialización ejecutado');

    return NextResponse.json({
      success: true,
      message: 'Sistema de inicialización ejecutado',
      timestamp: new Date().toISOString(),
      status: 'running',
      modules: ['api-session-cleanup', 'device-session-manager'],
    });
  } catch (error) {
    console.error('💥 [API INIT] Error durante inicialización:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error durante inicialización',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
