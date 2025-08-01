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

    if (!envExists) {
      return NextResponse.json({ isConfigured: false, needsSetup: true });
    }

    // Leer el archivo .env.local
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Verificar que las variables necesarias estén presentes
    const requiredVars = [
      'MONGODB_URI',
      'SMTP_EMAIL',
      'SMTP_PASSWORD'
    ];

    const missingVars = requiredVars.filter(varName => {
      const regex = new RegExp(`^${varName}=`, 'm');
      return !regex.test(envContent);
    });

    if (missingVars.length > 0) {
      return NextResponse.json({ isConfigured: false, needsSetup: true });
    }

    // Verificar conexión a MongoDB
    try {
      const connectionUri = ensureRestaurantDatabase(process.env.MONGODB_URI || '');
      
      await mongoose.connect(connectionUri, {
        bufferCommands: false,
      });

      // Verificar que la conexión esté activa
      const db = mongoose.connection;
      if (db.readyState !== 1) {
        throw new Error('Conexión no establecida');
      }

      // Importar el modelo User directamente
      const User = (await import('@/models/User')).default;

      const adminCount = await User.countDocuments({ role: 'admin', emailVerified: true });

      await mongoose.disconnect();

      if (adminCount === 0) {
        return NextResponse.json({ isConfigured: false, needsSetup: true });
      }

      return NextResponse.json({ isConfigured: true, needsSetup: false });
    } catch (error: unknown) {
      console.error('Error checking MongoDB connection:', error);
      await mongoose.disconnect();
      return NextResponse.json({ isConfigured: false, needsSetup: true });
    }
  } catch (error: unknown) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ isConfigured: false, needsSetup: true });
  }
} 