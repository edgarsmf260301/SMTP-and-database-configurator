'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useBrowserCloseDetection } from '@/hooks/useBrowserCloseDetection';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Hook para detectar cierre de navegador y cambios de visibilidad
  useBrowserCloseDetection();

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
