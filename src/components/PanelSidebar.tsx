import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Footer from './Footer';

export default function PanelSidebar({ open, onClose, navbarHeight = 64, onLogout }: { open: boolean; onClose: () => void; navbarHeight?: number; onLogout?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar comienza debajo de la navbar (por defecto 64px de alto)
  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: open ? 0 : -320, opacity: open ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="fixed left-0 z-40 w-72 h-full bg-[#151922] shadow-2xl flex flex-col"
      style={{
        pointerEvents: open ? "auto" : "none",
        top: navbarHeight,
        height: `calc(100vh - ${navbarHeight}px)`
      }}
    >
      <div className="flex flex-col gap-6 pt-12 px-6 flex-1">
        <button
          className={`w-full text-lg font-bold px-4 py-4 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 ${pathname === "/dashboard" ? "bg-orange-600/90 text-white hover:bg-orange-700" : "bg-[#23283a] text-white hover:bg-[#23283a]/80"}`}
          onClick={() => {
            router.push("/dashboard");
            onClose();
          }}
        >
          Dashboard
        </button>
        <button
          className={`w-full text-lg font-bold px-4 py-4 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 ${pathname.startsWith("/dashboard/usuarios") ? "bg-orange-600/90 text-white hover:bg-orange-700" : "bg-[#23283a] text-white hover:bg-[#23283a]/80"}`}
          onClick={() => {
            router.push("/dashboard/usuarios");
            onClose();
          }}
        >
          Usuarios
        </button>
      </div>
      {/* Footer solo visible en la barra lateral */}
      <div className="mt-auto mb-6 px-6">
        <Footer showLogout={true} onLogout={onLogout} />
      </div>
    </motion.aside>
  );
}
