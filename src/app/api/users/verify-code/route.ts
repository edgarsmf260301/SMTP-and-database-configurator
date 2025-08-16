import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import {
  getTempAdminVerification,
  deleteTempAdminVerification,
  setTempAdminEmailVerified,
} from '@/lib/temp-admin-verifications';

export async function POST(req: NextRequest) {
  console.log('🔐 [VERIFY CODE] Request received');

  let { email, code, context } = await req.json();
  email = email.trim().toLowerCase();

  console.log('🔐 [VERIFY CODE] Processing:', { email, code, context });

  if (!email || !code) {
    console.log('❌ [VERIFY CODE] Missing data');
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  try {
    // Si es para el setup principal, mantener el flujo original
    if (context === 'setup') {
      await dbConnect();
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      if (!user.verificationToken || !user.tokenExpires) {
        return NextResponse.json(
          { error: 'No se ha solicitado código de verificación' },
          { status: 400 }
        );
      }
      if (new Date() > user.tokenExpires) {
        return NextResponse.json(
          { error: 'El código ha expirado' },
          { status: 400 }
        );
      }
      const isValid = await bcrypt.compare(code, user.verificationToken);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Código incorrecto' },
          { status: 400 }
        );
      }
      user.emailVerified = true;
      user.verificationToken = undefined;
      user.tokenExpires = undefined;
      await user.save();
      return NextResponse.json({ success: true });
    }

    // Si es desde el módulo de usuarios, validar código en memoria
    console.log(
      '🔐 [VERIFY CODE] User module context - validating code in memory'
    );

    const temp = getTempAdminVerification(email);
    console.log(
      '🔐 [VERIFY CODE] Temp verification data:',
      temp ? 'Found' : 'Not found'
    );

    if (!temp) {
      console.log(
        '❌ [VERIFY CODE] No verification data found for email:',
        email
      );
      return NextResponse.json(
        { error: 'No se ha solicitado código de verificación' },
        { status: 400 }
      );
    }

    console.log(
      '🔐 [VERIFY CODE] Found verification data, checking expiration...'
    );
    if (Date.now() > temp.expires) {
      console.log('❌ [VERIFY CODE] Code expired for email:', email);
      deleteTempAdminVerification(email);
      return NextResponse.json(
        { error: 'El código ha expirado' },
        { status: 400 }
      );
    }

    console.log('🔐 [VERIFY CODE] Code not expired, comparing tokens...');
    const isValid = await bcrypt.compare(code, temp.hashedToken);
    if (!isValid) {
      console.log('❌ [VERIFY CODE] Invalid code for email:', email);
      return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 });
    }

    console.log(
      '✅ [VERIFY CODE] Code verified successfully for email:',
      email
    );

    // Actualizar el usuario en la base de datos
    await dbConnect();
    const user = await User.findOne({ email });
    if (user) {
      user.emailVerified = true;
      user.verificationToken = undefined;
      user.tokenExpires = undefined;
      await user.save();
      console.log('✅ [VERIFY CODE] User updated in database:', user.name);
    }

    // Marcar como verificado en memoria (frontend puede guardar este estado)
    deleteTempAdminVerification(email);
    setTempAdminEmailVerified(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('💥 [VERIFY CODE] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
