
import React, { useState } from 'react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelNavbar from '@/components/PanelNavbar';
import LoadingPage from '@/components/LoadingPage';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
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
    <div className="min-h-screen bg-[#101624] flex flex-col relative">
      {/* Navbar */}
      <PanelNavbar onMenuClick={() => setSidebarOpen((o) => !o)} />
      {/* Overlay para cerrar sidebar al hacer clic fuera */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}
      {/* Sidebar */}
      <PanelSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 transition-all duration-300 pt-20">
        {children}
      </main>
      {loggingOut && (
        <div className="fixed inset-0 z-[100]">
          <LoadingPage title="Cerrando sesión..." subtitle="Gracias por su visita" />
        </div>
      )}
    </div>
  );
}


