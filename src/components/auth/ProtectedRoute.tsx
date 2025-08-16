'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydration } from '@/hooks/useHydration';
import { useAuth } from '@/hooks/useAuth';
import LoadingPage from '../ui/LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'staff';
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const isHydrated = useHydration();

  useEffect(() => {
    if (!isHydrated) return;

    // Verificar si el sistema está configurado
    const checkSystemSetup = async () => {
      try {
        const setupResponse = await fetch('/api/setup/check-status');
        const setupData = await setupResponse.json();

        if (setupData.needsSetup) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error checking system setup:', error);
      }
    };

    checkSystemSetup();
  }, [router, isHydrated]);

  // Efecto para manejar redirecciones de autenticación
  useEffect(() => {
    if (!isHydrated || isLoading) return;

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (
      requiredRole &&
      (!Array.isArray(user?.roles) || !user.roles.includes(requiredRole))
    ) {
      router.push('/dashboard');
      return;
    }

    // Si hay un error de autenticación, redirigir al login
    if (error) {
      router.push('/login');
      return;
    }
  }, [
    isHydrated,
    isLoading,
    isAuthenticated,
    user,
    error,
    requiredRole,
    router,
  ]);

  // Si está cargando, mostrar pantalla de carga
  if (isLoading || !isHydrated) {
    return (
      <LoadingPage
        title="Verificando autenticación..."
        subtitle="Por favor, espera mientras verificamos tu sesión"
      />
    );
  }

  // Si no está autenticado o hay error, mostrar pantalla de carga mientras se redirige
  if (!isAuthenticated || error) {
    return <LoadingPage title="Redirigiendo..." subtitle="Por favor, espera" />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, mostrar pantalla de carga
  if (
    requiredRole &&
    (!Array.isArray(user?.roles) || !user.roles.includes(requiredRole))
  ) {
    return (
      <LoadingPage
        title="Acceso denegado..."
        subtitle="Redirigiendo al dashboard"
      />
    );
  }

  return <>{children}</>;
}
