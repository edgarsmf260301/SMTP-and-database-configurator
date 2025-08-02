<<<<<<< HEAD
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { mongodb } = await req.json();
    let uri = mongodb?.uri;
    if (!uri) {
      console.error('No se proporcionó la URI de MongoDB');
      throw new Error('No se proporcionó la URI de MongoDB');
    }
    // Limpiar doble barra y asegurar que la URI apunte a la base Restaurant
    uri = uri.replace(/\/\//g, '/');
    const regexDb = /mongodb(?:\+srv)?:\/\/[^/]+\/(\w+)/;
    if (!regexDb.test(uri) || !uri.includes('/Restaurant')) {
      uri = uri.replace(/(mongodb(?:\+srv)?:\/\/[^/]+)\/[^?]+/, '$1/Restaurant');
      if (!uri.includes('/Restaurant')) {
        const [base, params] = uri.split('?');
        uri = base.endsWith('/') ? base + 'Restaurant' : base + '/Restaurant';
        if (params) uri += '?' + params;
      }
    }
    console.log('Intentando conectar a MongoDB con URI:', uri);
    await dbConnect(uri);
    console.log('Conexión exitosa. Buscando usuario admin...');
    // Buscar admin activo en la colección configurada
    const admin = await User.findOne({ role: 'admin', isActive: true });
    console.log('Resultado de búsqueda admin:', admin);
    return NextResponse.json({ exists: !!admin });
  } catch (error) {
    console.error('Error verificando usuario administrador:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
=======
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from '@/models/User';
import { ensureRestaurantDatabase } from '@/lib/mongodb-utils';

function generateSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { mongodb, smtp } = await request.json();
    if (!mongodb?.uri) {
      return NextResponse.json({ error: 'La URI de MongoDB es requerida' }, { status: 400 });
    }
    if (!smtp?.email || !smtp?.password) {
      return NextResponse.json({ error: 'Las credenciales SMTP son requeridas' }, { status: 400 });
    }
    const connectionUri = ensureRestaurantDatabase(mongodb.uri);
    await mongoose.connect(connectionUri, { bufferCommands: false });
    const db = mongoose.connection;
    if (db.readyState !== 1) {
      throw new Error('Conexión no establecida');
    }
    const existingAdmin = await User.findOne({ role: 'admin' });
    await mongoose.disconnect();
    // Si existe admin, generar .env.local
    if (existingAdmin) {
      const envContent = `# Configuración de Base de Datos\nMONGODB_URI=${connectionUri}\n\n# Configuración de Email SMTP\nSMTP_EMAIL=${smtp.email}\nSMTP_PASSWORD=${smtp.password}\n\n# Configuración de la Aplicación\nNEXTAUTH_SECRET=${generateSecret()}\nNEXTAUTH_URL=http://localhost:3000\n`;
      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, envContent);
    }
    return NextResponse.json({ exists: !!existingAdmin });
  } catch (error: unknown) {
    await mongoose.disconnect();
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
>>>>>>> 608db6c74894ce726648d2d64f95bcbd6c269349
  }
}
