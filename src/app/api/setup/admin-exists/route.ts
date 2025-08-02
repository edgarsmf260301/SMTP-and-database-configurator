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
  }
}
