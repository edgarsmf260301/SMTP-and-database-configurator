'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydration } from './useHydration';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLoggingOut: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isLoggingOut: false,
  });
  const router = useRouter();
  const isHydrated = useHydration();

  useEffect(() => {
    if (!isHydrated) return;

    console.log('🔐 [USE AUTH] Iniciando verificación de autenticación');
    checkAuth();
  }, [isHydrated]);

  const checkAuth = async () => {
    try {
      console.log('🔐 [USE AUTH] Verificando autenticación');
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/check-session');
      const data = await response.json();

      console.log('🔐 [USE AUTH] Respuesta de check-session', {
        status: response.status,
        data: data,
      });

      if (data.authenticated && data.user) {
        console.log('🔐 [USE AUTH] Usuario autenticado exitosamente', {
          userId: data.user.id,
          email: data.user.email,
        });

        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isLoggingOut: false,
        });
      } else {
        console.log('🔐 [USE AUTH] Usuario no autenticado', {
          error: data.error,
          authenticated: data.authenticated,
        });

        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: data.error || 'No autenticado',
          isLoggingOut: false,
        });
      }
    } catch (error) {
      console.error('💥 [USE AUTH] Error durante verificación', error);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error de conexión',
        isLoggingOut: false,
      });
    }
  };

  const logout = async (reason?: string) => {
    try {
      console.log('🚪 [USE AUTH] Cerrando sesión:', reason);
      setAuthState(prev => ({ ...prev, isLoggingOut: true }));

      // Limpiar cookies del lado del cliente
      document.cookie =
        'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie =
        'session-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // Limpiar estado
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isLoggingOut: false,
      });

      // Redirigir a login
      router.push('/login');
    } catch (error) {
      console.error('💥 [USE AUTH] Error durante logout:', error);
      setAuthState(prev => ({ ...prev, isLoggingOut: false }));
    }
  };

  const softLogout = (reason?: string) => {
    console.log('🚪 [USE AUTH] Soft logout:', reason);

    // Limpiar estado
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: reason || 'Sesión cerrada',
      isLoggingOut: false,
    });

    // Redirigir a login después de un breve delay
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const requireAuth = (requiredRole?: string) => {
    if (!authState.isAuthenticated) {
      return false;
    }

    if (requiredRole && !authState.user?.roles.includes(requiredRole)) {
      return false;
    }

    return true;
  };

  return {
    ...authState,
    checkAuth,
    logout,
    softLogout,
    requireAuth,
  };
}
