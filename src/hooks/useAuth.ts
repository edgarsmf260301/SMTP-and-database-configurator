'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydration } from './useHydration';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'box' | 'kitchen' | 'administration' | 'Waiter';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const router = useRouter();
  const isHydrated = useHydration();

  useEffect(() => {
    if (!isHydrated) return;
    checkAuth();
  }, [isHydrated]);

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/check-session');
      const data = await response.json();

      if (data.authenticated && data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: data.error || 'No autenticado',
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Error de conexión',
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const requireAuth = (requiredRole?: 'admin' | 'box' | 'kitchen' | 'administration' | 'Waiter') => {
    if (authState.isLoading) return;

    if (!authState.isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && authState.user?.role !== requiredRole) {
      router.push('/dashboard');
      return;
    }
  };

  return {
    ...authState,
    logout,
    requireAuth,
    checkAuth,
  };
} 