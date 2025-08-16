import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { SESSION_CONFIG } from '@/lib/session-config';

export function useUserStatus() {
  const { user, softLogout } = useAuth();
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Verificar el estado del usuario cada 30 segundos
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();

        if (!data.authenticated) {
          if (data.error === 'Usuario desactivado') {
            console.log('Usuario deshabilitado por administrador');
            softLogout('Usuario deshabilitado por administrador');
          }
        }
      } catch (error) {
        console.error('Error verificando estado del usuario:', error);
      }
    };

    // Iniciar verificación periódica
    statusCheckIntervalRef.current = setInterval(
      checkUserStatus,
      SESSION_CONFIG.USER_STATUS_CHECK_INTERVAL
    );

    // Cleanup
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [user, softLogout]);

  return null; // Este hook no retorna nada, solo ejecuta efectos
}
