import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { uri } = await request.json();

    if (!uri) {
      return NextResponse.json(
        { error: 'URI de MongoDB es requerida' },
        { status: 400 }
      );
    }

    // Validar formato de URI
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      return NextResponse.json(
        { error: 'URI de MongoDB inválida' },
        { status: 400 }
      );
    }

    // Intentar conectar a MongoDB
    try {
      await mongoose.connect(uri, {
        bufferCommands: false,
        maxPoolSize: 1,
      });

      // Verificar que la conexión esté activa
      const db = mongoose.connection;
      if (db.readyState !== 1) {
        throw new Error('Conexión no establecida');
      }

      // Probar una operación simple
      const collections = await db.db.listCollections().toArray();
      
      await mongoose.disconnect();

      return NextResponse.json({
        success: true,
        message: 'Conexión a MongoDB establecida correctamente',
        collections: collections.length
      });
    } catch (connectionError: unknown) {
      await mongoose.disconnect();
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      throw new Error(`Error de conexión: ${errorMessage}`);
    }
  } catch (error: unknown) {
    console.error('Error testing MongoDB connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al conectar con MongoDB';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 