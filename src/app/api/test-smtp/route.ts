import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/send-verification-email';

export async function GET(req: NextRequest) {
  console.log('🧪 [TEST SMTP] Testing SMTP configuration...');

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  console.log(
    '📧 [TEST SMTP] SMTP_EMAIL:',
    smtpEmail ? '✅ Configurado' : '❌ No configurado'
  );
  console.log(
    '🔑 [TEST SMTP] SMTP_PASSWORD:',
    smtpPassword ? '✅ Configurado' : '❌ No configurado'
  );

  if (!smtpEmail || !smtpPassword) {
    return NextResponse.json(
      {
        success: false,
        error: 'Configuración SMTP incompleta',
        details: {
          SMTP_EMAIL: !!smtpEmail,
          SMTP_PASSWORD: !!smtpPassword,
        },
      },
      { status: 400 }
    );
  }

  // Probar envío de correo real
  try {
    console.log('🧪 [TEST SMTP] Testing actual email sending...');

    const smtp = {
      email: smtpEmail,
      password: smtpPassword,
    };

    const testEmail = 'test@example.com';
    const testName = 'Usuario de Prueba';

    const { code, hashedToken } = await sendVerificationEmail({
      email: testEmail,
      name: testName,
      smtp,
      expiresInSeconds: 120,
    });

    console.log('✅ [TEST SMTP] Test email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Configuración SMTP válida y funcionando',
      details: {
        SMTP_EMAIL: smtpEmail,
        SMTP_PASSWORD: '***',
        testEmail: testEmail,
        testName: testName,
        codeGenerated: !!code,
        hashedTokenGenerated: !!hashedToken,
      },
    });
  } catch (error) {
    console.error('💥 [TEST SMTP] Error testing email sending:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error al enviar correo de prueba',
        details: {
          SMTP_EMAIL: smtpEmail,
          SMTP_PASSWORD: '***',
          errorMessage:
            error instanceof Error ? error.message : 'Error desconocido',
        },
      },
      { status: 500 }
    );
  }
}
