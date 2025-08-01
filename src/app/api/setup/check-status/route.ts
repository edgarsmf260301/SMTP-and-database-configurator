import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Verificar si existe el archivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);

    if (!envExists) {
      return NextResponse.json({ needsSetup: true });
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
      return NextResponse.json({ needsSetup: true });
    }

    // Verificar conexión a MongoDB
    try {
      const mongoose = await import('mongoose');
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        return NextResponse.json({ needsSetup: true });
      }

      // Intentar conectar a MongoDB
      await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 1,
      });

      // Verificar si existe al menos un usuario admin
      const User = mongoose.default.models.User || mongoose.default.model('User', new mongoose.default.Schema({
        email: String,
        role: String,
      }));

      const adminCount = await User.countDocuments({ role: 'admin' });
      
      await mongoose.default.disconnect();

      if (adminCount === 0) {
        return NextResponse.json({ needsSetup: true });
      }

      return NextResponse.json({ needsSetup: false });
    } catch (error: unknown) {
      console.error('Error checking MongoDB connection:', error);
      return NextResponse.json({ needsSetup: true });
    }
  } catch (error: unknown) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ needsSetup: true });
  }
} 