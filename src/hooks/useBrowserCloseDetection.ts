import { useEffect } from 'react';

interface UseBrowserCloseDetectionProps {
  onBeforeUnload?: () => void;
  onVisibilityChange?: () => void;
  enabled?: boolean;
}

export function useBrowserCloseDetection({
  onBeforeUnload,
  onVisibilityChange,
  enabled = true,
}: UseBrowserCloseDetectionProps = {}) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Enviar señal al servidor para limpiar sesión
      if (onBeforeUnload) {
        onBeforeUnload();
      }

      // Usar sendBeacon para asegurar que la petición se envíe antes de cerrar
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/auth/browser-close');
      }

      // También intentar con fetch si sendBeacon no está disponible
      if (!navigator.sendBeacon) {
        fetch('/api/auth/browser-close', {
          method: 'POST',
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timestamp: Date.now() }),
        }).catch(() => {
          // Ignorar errores ya que la página se está cerrando
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // La página se ocultó (posible cierre de pestaña/navegador)
        if (onVisibilityChange) {
          onVisibilityChange();
        }

        // Enviar señal de cierre
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/auth/browser-close');
        }
      }
    };

    const handlePageHide = () => {
      // Evento que se dispara cuando la página se oculta
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/auth/browser-close');
      }
    };

    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, onBeforeUnload, onVisibilityChange]);
}
