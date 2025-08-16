import { useEffect } from 'react';

export function useServerInit() {
  useEffect(() => {
    // Inicializar el servidor cuando se monta el componente
    const initServer = async () => {
      try {
        console.log('🚀 [CLIENT INIT] Inicializando servidor...');

        const response = await fetch('/api/init', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ [CLIENT INIT] Servidor inicializado:', data);
        } else {
          console.warn('⚠️ [CLIENT INIT] Error inicializando servidor');
        }
      } catch (error) {
        console.error('💥 [CLIENT INIT] Error durante inicialización:', error);
      }
    };

    // Ejecutar inicialización
    initServer();
  }, []);

  return null;
}
