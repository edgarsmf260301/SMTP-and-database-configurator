import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/send-verification-email';
import { setTempAdminVerification } from '@/lib/temp-admin-verifications';

export async function POST(req: NextRequest) {
  let { email, name, context } = await req.json();
  email = email.trim().toLowerCase();
  if (!email || !name) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  // Si es para el setup principal, mantener el flujo original (crear usuario temporal)
  if (context === 'setup') {
    await mongoose.connect(process.env.MONGODB_URI!);
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, roles: ['admin'], isActive: false, password: Math.random().toString(36).slice(-8) });
    }
    const smtp = {
      email: process.env.SMTP_EMAIL!,
      password: process.env.SMTP_PASSWORD!,
    };
    const { code, hashedToken } = await sendVerificationEmail({ email, name, smtp, expiresInSeconds: 120 });
    user.verificationToken = hashedToken;
    user.tokenExpires = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();
    return NextResponse.json({ success: true });
  }
  // Si es desde el módulo de usuarios, solo guardar código temporal en memoria
  const smtp = {
    email: process.env.SMTP_EMAIL!,
    password: process.env.SMTP_PASSWORD!,
  };
  const { code, hashedToken } = await sendVerificationEmail({ email, name, smtp, expiresInSeconds: 120 });
  setTempAdminVerification(email, {
    code,
    hashedToken,
    expires: Date.now() + 2 * 60 * 1000,
    name
  });
  return NextResponse.json({ success: true });
}
