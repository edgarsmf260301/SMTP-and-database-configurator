import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { consumeTempAdminEmailVerified } from '@/lib/temp-admin-verifications';
import jwt from 'jsonwebtoken';


// Helper para validar roles permitidos por JWT
const ALLOWED_ROLES = ['admin', 'box', 'kitchen', 'administration', 'Waiter'];
async function isAllowed(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || req.cookies.get('auth-token')?.value;
  const token = authHeader?.replace('Bearer ', '') || '';
  if (!token) {
    return false;
  }
  try {
    const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findById(decoded.userId);
    return user && Array.isArray(user.roles) && user.roles.some((r: string) => ALLOWED_ROLES.includes(r)) && user.isActive;
  } catch (err) {
    return false;
  }
}

// GET: Listar usuarios
export async function GET(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  const users = await User.find({}, '-password');
  return NextResponse.json({ users });
}

// POST: Registrar usuario
export async function POST(req: NextRequest) {
  // Permitir verificación de unicidad sin autenticación
  const url = req.nextUrl || (req as any).url;
  let checkUnique = false;
  let searchParams;
  if (typeof url === 'string') {
    searchParams = new URL(url, 'http://localhost').searchParams;
  } else if (url && url.searchParams) {
    searchParams = url.searchParams;
  }
  if (searchParams && searchParams.get('checkUnique') === '1') {
    const { name, email, userId, adminIntent } = await req.json();
    await mongoose.connect(process.env.MONGODB_URI!);
    // Si es edición y se quiere pasar a admin, solo bloquear si existe OTRO usuario con ese correo y emailVerified true
    if (adminIntent && userId) {
      const exists = await User.findOne({ email, emailVerified: true, _id: { $ne: userId } });
      if (exists) {
        return NextResponse.json({ unique: false, message: 'Ya existe un usuario administrador con este correo verificado' }, { status: 200 });
      }
      return NextResponse.json({ unique: true }, { status: 200 });
    }
    // Registro normal: bloquear si existe cualquier usuario con ese correo o nombre
    const exists = await User.findOne({ $or: [ { email }, { name } ] });
    if (exists) {
      return NextResponse.json({ unique: false, message: 'El usuario o correo ya existe' }, { status: 200 });
    }
    return NextResponse.json({ unique: true }, { status: 200 });
  }
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { name, email, roles, isActive, password } = await req.json();
  if (!name || !email || !roles || !Array.isArray(roles) || roles.length === 0 || !password) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  // Validar que si se selecciona admin, el array de roles incluya 'admin'
  if (roles.includes('admin') && !roles.some(r => r === 'admin')) {
    return NextResponse.json({ error: 'El usuario debe tener el rol de admin' }, { status: 400 });
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
  }
  let emailVerified = false;
  if (roles.includes('admin')) {
    emailVerified = consumeTempAdminEmailVerified(email);
  }
  const user = new User({ name, email, roles, isActive, password, emailVerified });
  await user.save();
  return NextResponse.json({ success: true });
}
