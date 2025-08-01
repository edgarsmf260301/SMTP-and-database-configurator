import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import SetupWizard from '@/components/SetupWizard';
import LoginPage from '@/components/LoginPage';

async function checkSetupStatus() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);
    
    if (!envExists) {
      return { needsSetup: true };
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredVars = ['MONGODB_URI', 'SMTP_EMAIL', 'SMTP_PASSWORD'];
    const missingVars = requiredVars.filter(varName => {
      const regex = new RegExp(`^${varName}=`, 'm');
      return !regex.test(envContent);
    });

    if (missingVars.length > 0) {
      return { needsSetup: true };
    }

    // Verificar si hay un usuario admin verificado
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/setup/check-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { needsSetup: data.needsSetup };
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }

    return { needsSetup: true };
  } catch (error: unknown) {
    console.error('Error checking setup status:', error);
    return { needsSetup: true };
  }
}

export default async function HomePage() {
  const { needsSetup } = await checkSetupStatus();

  if (needsSetup) {
    return <SetupWizard />;
  }

  return <LoginPage />;
}
