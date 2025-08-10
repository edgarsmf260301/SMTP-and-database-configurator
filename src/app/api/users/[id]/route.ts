import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

// PATCH: Editar usuario
export async function PATCH(req: NextRequest, context: any) {
  const params = await context.params;
  const { id } = params;
  const { name, email, roles, isActive } = await req.json();
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await User.findById(id);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  let emailChanged = false;
  // Validar nombre único entre usuarios habilitados (excepto el propio)
  if (name && name !== user.name) {
    const nameExists = await User.findOne({ name, isActive: true, _id: { $ne: user._id } });
    if (nameExists) {
      return NextResponse.json({ error: 'Ya existe un usuario habilitado con ese nombre.' }, { status: 400 });
    }
  }
  // Validar email único entre usuarios con emailVerified true (excepto el propio)
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, emailVerified: true, _id: { $ne: user._id } });
    if (emailExists) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo verificado.' }, { status: 400 });
    }
    user.email = email;
    user.emailVerified = false;
    user.verificationToken = undefined;
    user.tokenExpires = undefined;
    emailChanged = true;
  }
  if (name) user.name = name;
  if (Array.isArray(roles)) user.roles = roles;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  // Si el usuario está siendo promovido a admin y emailVerified es false, pero ya fue verificado en el frontend,
  // entonces actualizar emailVerified a true
  if (Array.isArray(roles) && roles.includes('admin') && user.emailVerified === false) {
    // El frontend solo permite guardar si ya fue verificado
    user.emailVerified = true;
  }

  await user.save();
  return NextResponse.json({ success: true, emailChanged });
}
