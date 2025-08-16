import { NextResponse } from 'next/server';
import mongoose from 'mongodb';
import rateLimiter from '@/lib/rate-limiter';

export async function GET() {
  try {
    const startTime = Date.now();

    // Verificar conexión a MongoDB
    let mongoStatus = 'disconnected';
    let mongoResponseTime = 0;

    try {
      const mongoStart = Date.now();
      if (mongoose.connection.readyState === 1) {
        mongoStatus = 'connected';
        // Hacer una consulta simple para verificar la conexión
        await mongoose.connection.db.admin().ping();
        mongoResponseTime = Date.now() - mongoStart;
      }
    } catch (error) {
      mongoStatus = 'error';
      console.error('MongoDB health check error:', error);
    }

    // Obtener estadísticas del rate limiter
    const rateLimitStats = rateLimiter.getStats();

    // Verificar variables de entorno críticas
    const envStatus = {
      MONGODB_URI: !!process.env.MONGODB_URI,
      SMTP_EMAIL: !!process.env.SMTP_EMAIL,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    };

    const totalResponseTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      services: {
        mongodb: {
          status: mongoStatus,
          responseTime: mongoResponseTime,
          readyState: mongoose.connection.readyState,
        },
        rateLimiter: rateLimitStats,
        environment: envStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Determinar el status general
    if (
      mongoStatus === 'error' ||
      !envStatus.MONGODB_URI ||
      !envStatus.NEXTAUTH_SECRET
    ) {
      healthData.status = 'unhealthy';
      return NextResponse.json(healthData, { status: 503 });
    }

    if (mongoStatus === 'disconnected') {
      healthData.status = 'degraded';
      return NextResponse.json(healthData, { status: 200 });
    }

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Internal server error during health check',
      },
      { status: 500 }
    );
  }
}
