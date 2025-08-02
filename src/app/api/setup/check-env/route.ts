import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      return NextResponse.json({ exists: false });
    }
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    let mongodb = '';
    let smtp = { email: '', password: '' };
    for (const line of lines) {
      if (line.startsWith('MONGODB_URI=')) mongodb = line.replace('MONGODB_URI=', '').trim();
      if (line.startsWith('SMTP_EMAIL=')) smtp.email = line.replace('SMTP_EMAIL=', '').trim();
      if (line.startsWith('SMTP_PASSWORD=')) smtp.password = line.replace('SMTP_PASSWORD=', '').trim();
    }
    return NextResponse.json({ exists: true, mongodb, smtp });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error leyendo .env.local' }, { status: 500 });
  }
}
