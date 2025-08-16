'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SetupWizard from '@/components/users/SetupWizard';
import LoginPage from '@/components/auth/LoginPage';
import LoadingPage from '@/components/ui/LoadingPage';
import SystemCheckPage from '@/components/users/SystemCheckPage';

export default function HomePage() {
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // Simular un pequeño delay para mostrar la verificación
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch('/api/setup/check-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setNeedsSetup(data.needsSetup);
        } else {
          setNeedsSetup(true);
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setNeedsSetup(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupStatus();
  }, []);

  useEffect(() => {
    if (!isChecking && !needsSetup) {
      // Redirigir a /login si todo está validado
      router.replace('/login');
    }
  }, [isChecking, needsSetup, router]);

  if (isChecking) {
    return <SystemCheckPage />;
  }

  if (needsSetup) {
    return <SetupWizard />;
  }

  // Mientras redirige, puedes mostrar un loader
  return <LoadingPage />;
}
