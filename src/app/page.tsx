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

    // Check if we can connect to MongoDB and if admin user exists
    try {
      const mongoose = await import('mongoose');
      const MONGODB_URI = process.env.MONGODB_URI;
      
      if (!MONGODB_URI) {
        return { needsSetup: true };
      }

      await mongoose.default.connect(MONGODB_URI, { 
        bufferCommands: false, 
        maxPoolSize: 1 
      });

      const User = mongoose.default.models.User || 
        mongoose.default.model('User', new mongoose.default.Schema({ 
          email: String, 
          role: String 
        }));

      const adminCount = await User.countDocuments({ role: 'admin' });
      await mongoose.default.disconnect();

      if (adminCount === 0) {
        return { needsSetup: true };
      }

      return { needsSetup: false };
    } catch (error: unknown) {
      console.error('Error checking MongoDB connection:', error);
      return { needsSetup: true };
    }
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
