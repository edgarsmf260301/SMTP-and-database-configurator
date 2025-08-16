'use client';

import { ReactNode } from 'react';
import { useServerInit } from '@/hooks/useServerInit';

interface ServerInitWrapperProps {
  children: ReactNode;
}

export default function ServerInitWrapper({
  children,
}: ServerInitWrapperProps) {
  // Inicializar el servidor cuando se monta el componente
  useServerInit();

  return <>{children}</>;
}
