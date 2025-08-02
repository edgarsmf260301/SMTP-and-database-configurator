import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';

export async function GET() {
  try {
    // Verificar si existe el archivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);

    let mongoUri = '';
    let smtpEmail = '';
    let smtpPassword = '';

<<<<<<< HEAD
    if (envExists) {
      // Leer el archivo .env.local
      const envContent = fs.readFileSync(envPath, 'utf-8');
      // Extraer las variables
      const getEnvVar = (name: string) => {
        const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
        return match ? match[1].trim() : '';
      };
      mongoUri = getEnvVar('MONGODB_URI');
      smtpEmail = getEnvVar('SMTP_EMAIL');
      smtpPassword = getEnvVar('SMTP_PASSWORD');

      // Verificar que las variables necesarias estén presentes
      if (!mongoUri || !smtpEmail || !smtpPassword) {
        return NextResponse.json({ isConfigured: false, needsSetup: true });
      }
    } else {
      // Si no existe el archivo, no se puede verificar, requiere setup
=======
    // Leer el archivo .env.local
    const envContent = fs.readFileSync(envPath, 'utf-8');

    // Extraer variables del archivo .env.local
    const getEnvVar = (name: string) => {
      const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
      return match ? match[1].trim() : '';
    };

    const mongoUri = getEnvVar('MONGODB_URI');
    const smtpEmail = getEnvVar('SMTP_EMAIL');
    const smtpPassword = getEnvVar('SMTP_PASSWORD');

    // Verificar que las variables necesarias estén presentes
    if (!mongoUri || !smtpEmail || !smtpPassword) {
      return NextResponse.json({ isConfigured: false, needsSetup: true });
    }

    // Verificar conexión a MongoDB usando el método global
    try {
      // Importar el método dbConnect desde lib/mongodb.ts
      const dbConnect = (await import('@/lib/mongodb')).default;
      // dbConnect ya usa la URI de entorno, pero para flexibilidad, permite pasar la URI si es necesario
      await dbConnect();

      // Importar el modelo User directamente
      const User = (await import('@/models/User')).default;
      const adminCount = await User.countDocuments({ role: 'admin', emailVerified: true });

      if (adminCount === 0) {
        return NextResponse.json({ isConfigured: false, needsSetup: true });
      }

      return NextResponse.json({ isConfigured: true, needsSetup: false });
    } catch (error: unknown) {
      console.error('Error checking MongoDB connection:', error);
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
      return NextResponse.json({ isConfigured: false, needsSetup: true });
    }

      // Verificar conexión a MongoDB usando dbConnect
      try {
        const dbConnect = (await import('@/lib/mongodb')).default;
        const connectionUri = ensureRestaurantDatabase(mongoUri);
        await dbConnect(connectionUri);

        if (mongoose.connection.readyState !== 1) {
          throw new Error('Conexión no establecida');
        }

        const User = (await import('@/models/User')).default;
        // Buscar admin activo y con email verificado
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true, emailVerified: true });
        console.log('[check-status] Admins encontrados:', adminCount);

        // No cerrar la conexión manualmente, dejar que el singleton la maneje

        if (adminCount === 0) {
          console.log('[check-status] No se encontró admin activo y verificado');
          return NextResponse.json({ isConfigured: false, needsSetup: true });
        }

        console.log('[check-status] Sistema configurado correctamente');
        return NextResponse.json({ isConfigured: true, needsSetup: false });
      } catch (error: unknown) {
        console.error('Error checking MongoDB connection:', error);
        return NextResponse.json({ isConfigured: false, needsSetup: true });
      }
  } catch (error: unknown) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ isConfigured: false, needsSetup: true });
  }
} 