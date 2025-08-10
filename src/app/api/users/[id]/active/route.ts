import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { isActive } = await req.json();
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await User.findById(params.id);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  user.isActive = isActive;
  await user.save();
  return NextResponse.json({ success: true });
}
