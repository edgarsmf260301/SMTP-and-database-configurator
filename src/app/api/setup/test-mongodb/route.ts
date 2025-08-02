import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';

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

    // Intentar conectar a MongoDB y verificar admin
    try {
      const connectionUri = ensureRestaurantDatabase(uri);
      if (mongoose.connection.readyState !== 1) {
        await import('@/lib/mongodb').then(mod => mod.dbConnect(connectionUri));
      }
      // Usar la base Restaurant explícitamente
      const db = mongoose.connection.useDb('Restaurant');
      // Probar una operación simple
      const collections = await db.db?.listCollections().toArray();

      // Buscar usuario admin activo en la colección users
      let adminExists = false;
      try {
        // Importar el esquema del modelo User
        const { userSchema } = await import('@/models/User');
        // Usar el modelo User en la base configurada, evitando duplicados
        let UserModel: mongoose.Model<any>;
        if (db.models.User) {
          UserModel = db.models.User as mongoose.Model<any>;
        } else {
          UserModel = db.model('User', userSchema) as mongoose.Model<any>;
        }
        // Buscar usuario admin activo
        const admin = await UserModel.findOne({ role: 'admin', isActive: true }).exec();
        adminExists = !!admin;
      } catch (adminError) {
        adminExists = false;
      }

      return NextResponse.json({
        success: true,
        message: 'Conexión a MongoDB establecida correctamente',
        collections: Array.isArray(collections) ? collections.length : 0,
        adminExists
      });
    } catch (connectionError: unknown) {
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