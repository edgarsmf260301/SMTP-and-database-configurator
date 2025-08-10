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

    // Intentar conectar a MongoDB y verificar admin usando createConnection
    const connectionUri = uri;
    let testConn: mongoose.Connection | null = null;
    try {
      testConn = await mongoose.createConnection(connectionUri, {
        dbName: 'Restaurant',
        serverSelectionTimeoutMS: 5000,
      }).asPromise();

      // Probar una operación simple
      const collections = await testConn.db?.listCollections().toArray();

      // Buscar usuario admin activo en la colección users
      let adminExists = false;
      try {
        const { userSchema } = await import('@/models/User');
        let UserModel: mongoose.Model<any>;
        if (testConn.models.User) {
          UserModel = testConn.models.User as mongoose.Model<any>;
        } else {
          UserModel = testConn.model('User', userSchema) as mongoose.Model<any>;
        }
  const admin = await UserModel.findOne({ roles: 'admin', isActive: true }).exec();
  adminExists = !!admin;
      } catch {
        adminExists = false;
      }

      await testConn.close();

      return NextResponse.json({
        success: true,
        message: 'Conexión a MongoDB establecida correctamente',
        collections: Array.isArray(collections) ? collections.length : 0,
        adminExists
      });
    } catch (connectionError: unknown) {
      if (testConn) await testConn.close();
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Error de conexión desconocido';
      return NextResponse.json(
        { error: `Error de conexión: ${errorMessage}` },
        { status: 500 }
      );
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