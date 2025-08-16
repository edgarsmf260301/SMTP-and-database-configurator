import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/send-verification-email';
import { setTempAdminVerification } from '@/lib/temp-admin-verifications';

export async function POST(req: NextRequest) {
  console.log('📧 [SEND VERIFICATION] Request received');

  let { email, name, context } = await req.json();
  email = email.trim().toLowerCase();

  console.log('📧 [SEND VERIFICATION] Processing:', { email, name, context });

  if (!email || !name) {
    console.log('❌ [SEND VERIFICATION] Missing data');
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  }

  // Verificar configuración SMTP
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  console.log('📧 [SEND VERIFICATION] SMTP configuration:', {
    email: smtpEmail ? '✅ Configurado' : '❌ No configurado',
    password: smtpPassword ? '✅ Configurado' : '❌ No configurado',
  });

  if (!smtpEmail || !smtpPassword) {
    console.error('❌ [SEND VERIFICATION] SMTP configuration missing');
    return NextResponse.json(
      { error: 'Configuración SMTP incompleta' },
      { status: 500 }
    );
  }

  const smtp = {
    email: smtpEmail,
    password: smtpPassword,
  };

  try {
    // Si es para el setup principal, mantener el flujo original (crear usuario temporal)
    if (context === 'setup') {
      await dbConnect();
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name,
          email,
          roles: ['admin'],
          isActive: false,
          password: Math.random().toString(36).slice(-8),
        });
      }
      const { code, hashedToken } = await sendVerificationEmail({
        email,
        name,
        smtp,
        expiresInSeconds: 120,
      });
      user.verificationToken = hashedToken;
      user.tokenExpires = new Date(Date.now() + 2 * 60 * 1000);
      await user.save();
      return NextResponse.json({ success: true });
    }

    // Si es desde el módulo de usuarios, solo guardar código temporal en memoria
    console.log(
      '📧 [SEND VERIFICATION] User module context - sending verification email'
    );

    console.log('📧 [SEND VERIFICATION] Calling sendVerificationEmail...');
    const { code, hashedToken } = await sendVerificationEmail({
      email,
      name,
      smtp,
      expiresInSeconds: 120,
    });
    console.log(
      '✅ [SEND VERIFICATION] Email sent successfully, code generated:',
      { code: code ? '***' : 'No code' }
    );

    setTempAdminVerification(email, {
      code,
      hashedToken,
      expires: Date.now() + 2 * 60 * 1000,
      name,
    });
    console.log(
      '✅ [SEND VERIFICATION] Verification data stored in memory for email:',
      email
    );

    return NextResponse.json({
      success: true,
      message: 'Correo de verificación enviado exitosamente',
    });
  } catch (error) {
    console.error('💥 [SEND VERIFICATION] Error sending email:', error);
    return NextResponse.json(
      {
        error:
          'Error al enviar correo de verificación: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      },
      { status: 500 }
    );
  }
}
