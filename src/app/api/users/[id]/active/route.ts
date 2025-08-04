import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // Aquí deberías validar que el usuario sea admin (puedes usar check-session y validar el role)
  const { isActive } = await req.json();
  await mongoose.connect(process.env.MONGODB_URI!);
  await User.findByIdAndUpdate(params.id, { isActive });
  return NextResponse.json({ success: true });
}
