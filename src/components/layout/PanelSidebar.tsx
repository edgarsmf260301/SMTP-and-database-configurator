import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from './Footer';

export default function PanelSidebar({
  open,
  onClose,
  navbarHeight = 64,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  navbarHeight?: number;
  onLogout?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar comienza debajo de la navbar (por defecto 64px de alto)
  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: open ? 0 : -320, opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="fixed left-0 z-40 w-72 h-full bg-gradient-to-b from-gray-800 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700/40 flex flex-col backdrop-blur-sm"
      style={{
        pointerEvents: open ? 'auto' : 'none',
        top: navbarHeight,
        height: `calc(100vh - ${navbarHeight}px)`,
      }}
    >
      <div className="flex flex-col gap-4 pt-8 px-6 flex-1">
        {/* Dashboard Button */}
        <motion.button
          className={`w-full text-lg font-bold px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
            pathname === '/dashboard'
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/25 hover:from-orange-600 hover:to-red-700'
              : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700/80 border border-gray-600/30 hover:border-orange-500/30'
          }`}
          onClick={() => {
            router.push('/dashboard');
            onClose();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${pathname === '/dashboard' ? 'bg-white/20' : 'bg-gray-600/50'}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Dashboard
          </div>
        </motion.button>

        {/* Users Button */}
        <motion.button
          className={`w-full text-lg font-bold px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
            pathname.startsWith('/dashboard/users')
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/25 hover:from-orange-600 hover:to-red-700'
              : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700/80 border border-gray-600/30 hover:border-orange-500/30'
          }`}
          onClick={() => {
            router.push('/dashboard/users');
            onClose();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${pathname.startsWith('/dashboard/users') ? 'bg-white/20' : 'bg-gray-600/50'}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            Users
          </div>
        </motion.button>
      </div>

      {/* Footer solo visible en la barra lateral */}
      <div className="mt-auto mb-6 px-6">
        <Footer showLogout={true} onLogout={onLogout} />
      </div>
    </motion.aside>
  );
}
