
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import { compareVerificationToken } from '@/lib/token-utils';
import { getTempAdminVerification, deleteTempAdminVerification, setTempAdminEmailVerified, tempAdminVerifications } from '@/lib/temp-admin-verifications';
import * as tempAdminVerifModule from '@/lib/temp-admin-verifications';

export async function POST(req: NextRequest) {
  let { email, code, context } = await req.json();
  email = email.trim().toLowerCase();
  if (!email || !code) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }
  // Si es para el setup principal, mantener el flujo original
  if (context === 'setup') {
    await mongoose.connect(process.env.MONGODB_URI!);
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (!user.verificationToken || !user.tokenExpires) {
      return NextResponse.json({ error: 'No se ha solicitado código de verificación' }, { status: 400 });
    }
    if (new Date() > user.tokenExpires) {
      return NextResponse.json({ error: 'El código ha expirado' }, { status: 400 });
    }
    const isValid = await compareVerificationToken(code, user.verificationToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 });
    }
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.tokenExpires = undefined;
    await user.save();
    return NextResponse.json({ success: true });
  }
  // Si es desde el módulo de usuarios, validar código en memoria
  const temp = getTempAdminVerification(email);
  if (!temp) {
    return NextResponse.json({ error: 'No se ha solicitado código de verificación' }, { status: 400 });
  }
  if (Date.now() > temp.expires) {
    deleteTempAdminVerification(email);
    return NextResponse.json({ error: 'El código ha expirado' }, { status: 400 });
  }
  const isValid = await compareVerificationToken(code, temp.hashedToken);
  if (!isValid) {
    return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 });
  }
  // Marcar como verificado en memoria (frontend puede guardar este estado)
  deleteTempAdminVerification(email);
  setTempAdminEmailVerified(email);
  return NextResponse.json({ success: true });
}