'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHydration } from '@/hooks/useHydration';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'staff';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (!isHydrated) return;

    const checkAuth = async () => {
      try {
        // Verificar si el sistema está configurado
        const setupResponse = await fetch('/api/setup/check-status');
        const setupData = await setupResponse.json();

        if (setupData.needsSetup) {
          router.push('/');
          return;
        }

        // Verificar autenticación
        const authResponse = await fetch('/api/auth/check-session');
        
        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const authData = await authResponse.json();

        if (!authData.authenticated) {
          router.push('/login');
          return;
        }

        // Verificar rol si es necesario
        if (requiredRole && authData.user?.role !== requiredRole) {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole, isHydrated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
} 