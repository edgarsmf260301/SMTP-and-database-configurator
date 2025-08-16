import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { roles } = await req.json();
  if (!Array.isArray(roles) || roles.length === 0) {
    return NextResponse.json(
      { error: 'Debes proporcionar al menos un rol' },
      { status: 400 }
    );
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await User.findById(params.id);
  if (!user) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    );
  }
  // Si el usuario va a ser admin y no está verificado, debe verificar correo
  if (roles.includes('admin') && !user.emailVerified) {
    return NextResponse.json(
      {
        error:
          'Para asignar el rol de administrador, primero debe verificar el correo electrónico.',
      },
      { status: 400 }
    );
  }
  user.roles = roles;
  await user.save();
  return NextResponse.json({ success: true });
}
