
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Restaurant';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongoose;
// @ts-ignore
if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null, uri: null };
}


export async function dbConnect(uri?: string) {
  // Siempre usar la URI principal del entorno
  const connectionUri = MONGODB_URI;
  const CONNECTED = mongoose.ConnectionStates ? mongoose.ConnectionStates.connected : 1;
  // Si ya tenemos una conexión activa, devolverla
  if (cached.conn && mongoose.connection.readyState === CONNECTED) {
    return cached.conn;
  }

  // Si hay una promesa en curso, esperar a que termine
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      if (mongoose.connection.readyState !== CONNECTED) {
        console.warn('[dbConnect] Conexión sigue en estado 0 tras promesa, reintentando...');
        cached.promise = mongoose.connect(connectionUri, {
          bufferCommands: false,
          dbName: 'Restaurant',
        });
        try {
          cached.conn = await cached.promise;
        } catch (e) {
          cached.promise = null;
          console.error('[dbConnect] Error al reintentar conexión:', e);
          throw e;
        }
        if (mongoose.connection.readyState !== CONNECTED) {
          console.error('[dbConnect] Conexión no establecida tras reintento');
          throw new Error('MongoDB connection not established (reintento)');
        }
      }
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      console.error('[dbConnect] Error en promesa existente:', e);
      throw e;
    }
  }

  // Crear nueva conexión solo si no existe
  const opts = {
    bufferCommands: false,
    dbName: 'Restaurant',
  };

  cached.uri = connectionUri;
  cached.promise = mongoose.connect(connectionUri, opts);

  try {
    cached.conn = await cached.promise;
    if (mongoose.connection.readyState !== CONNECTED) {
      console.error('[dbConnect] Conexión no establecida');
      throw new Error('MongoDB connection not established');
    }
  } catch (e) {
    cached.promise = null;
    console.error('[dbConnect] Error al conectar:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;