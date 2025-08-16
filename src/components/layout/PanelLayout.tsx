import React, { useState } from 'react';
import PanelSidebar from './PanelSidebar';
import PanelNavbar from './PanelNavbar';
import LoadingPage from '@/components/ui/LoadingPage';
import { useAuth } from '@/hooks/useAuth';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoggingOut, softLogout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setTimeout(() => {
        window.location.replace('/login');
      }, 1200);
    } catch {
      window.location.replace('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col relative">
      {/* Navbar */}
      <PanelNavbar onMenuClick={() => setSidebarOpen(o => !o)} />

      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Sidebar */}
      <PanelSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 transition-all duration-300 pt-20">
        {children}
      </main>

      {/* Pantalla de cierre de sesión */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[100]">
          <LoadingPage
            title="Cerrando sesión..."
            subtitle="Gracias por su visita"
          />
        </div>
      )}
    </div>
  );
}
