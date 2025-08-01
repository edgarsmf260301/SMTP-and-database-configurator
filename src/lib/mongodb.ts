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
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Si ya tenemos una conexión activa, devolverla
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Si hay una promesa en curso, esperar a que termine
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  // Crear nueva conexión
  const opts = {
    bufferCommands: false,
  };

  cached.promise = mongoose.connect(MONGODB_URI, opts);

  try {
    cached.conn = await cached.promise;
    
    // Verificar que la conexión esté establecida
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection not established');
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 