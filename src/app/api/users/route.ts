import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
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
    return user && ALLOWED_ROLES.includes(user.role) && user.isActive;
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
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const { name, email, role, isActive, password } = await req.json();
  if (!name || !email || !role || !password) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
  }
  const user = new User({ name, email, role, isActive, password });
  await user.save();
  return NextResponse.json({ success: true });
}
