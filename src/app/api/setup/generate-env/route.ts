import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mongodb, smtp, format } = body;
    // LOG para depuración
    console.log('[generate-env] Body recibido:', JSON.stringify(body, null, 2));

    let envContent = '';
    if (format === 'example') {
      envContent += '# Configuración de Base de Datos MongoDB\n';
      envContent +=
        '# Ejemplo: mongodb+srv://usuario:contraseña@cluster.mongodb.net/Restaurant\n';
      envContent += `MONGODB_URI=${mongodb?.uri || ''}\n\n`;
      envContent += '# Configuración de Email SMTP (Gmail)\n';
      envContent +=
        '# Usar contraseña de aplicación de Google, no la contraseña normal\n';
      envContent += `SMTP_EMAIL=${smtp?.email || ''}\n`;
      envContent += `SMTP_PASSWORD=${smtp?.password || ''}\n\n`;
      envContent += '# Configuración de la Aplicación\n';
      envContent += '# Se genera automáticamente durante la configuración\n';
      const secret = generateSecret();
      envContent += `NEXTAUTH_SECRET=${secret}\n`;
      envContent += 'NEXTAUTH_URL=http://localhost:3000\n\n';
      envContent += '# Configuración de Desarrollo\n';
      envContent += 'NODE_ENV=development\n';
    } else {
      if (mongodb?.uri) {
        envContent += `MONGODB_URI=${mongodb.uri}\n`;
      }
      if (smtp?.email) {
        envContent += `SMTP_EMAIL=${smtp.email}\n`;
      }
      if (smtp?.password) {
        envContent += `SMTP_PASSWORD=${smtp.password}\n`;
      }
      // Generar NEXTAUTH_SECRET aleatorio si no se provee
      const secret = body.nextauth_secret || generateSecret();
      envContent += `NEXTAUTH_SECRET=${secret}\n`;
      envContent += 'NEXTAUTH_URL=http://localhost:3000\n';
      envContent += 'NODE_ENV=development\n';
    }
    // Generador de secreto aleatorio
    function generateSecret(): string {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

  const envPath = path.resolve(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
  // LOG para depuración
  console.log('[generate-env] Archivo .env.local generado con contenido:\n', envContent);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error generando .env.local' },
      { status: 500 }
    );
  }
}
