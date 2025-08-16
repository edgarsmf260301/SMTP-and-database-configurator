'use client';

import { useBrowserCloseDetection } from '@/hooks/useBrowserCloseDetection';
import { useAuth } from '@/hooks/useAuth';

export default function BrowserCloseHandler() {
  const { logout } = useAuth();

  const handleBeforeUnload = () => {
    console.log('🚪 [BROWSER CLOSE] Navegador cerrando, limpiando sesiones...');
  };

  const handleVisibilityChange = () => {
    console.log(
      '👁️ [VISIBILITY] Pestaña oculta, posible cierre de navegador...'
    );
  };

  useBrowserCloseDetection({
    onBeforeUnload: handleBeforeUnload,
    onVisibilityChange: handleVisibilityChange,
    enabled: true,
  });

  // Este componente no renderiza nada, solo maneja eventos
  return null;
}
