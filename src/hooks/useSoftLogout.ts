import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSoftLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const softLogout = async (reason?: string) => {
    setIsLoggingOut(true);

    // Mostrar pantalla de "Cerrando sesión" por 1.2 segundos
    setTimeout(async () => {
      try {
        // Limpiar cookies del lado del cliente si es necesario
        document.cookie.split(';').forEach(function (c) {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(
              /=.*/,
              '=;expires=' + new Date().toUTCString() + ';path=/'
            );
        });

        // Redirigir al login
        router.push('/login');
      } catch (error) {
        console.error('Error during soft logout:', error);
        router.push('/login');
      } finally {
        setIsLoggingOut(false);
      }
    }, 1200);
  };

  const forceLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error during force logout:', error);
      router.push('/login');
    }
  };

  return {
    isLoggingOut,
    softLogout,
    forceLogout,
  };
}
