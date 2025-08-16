import React from 'react';
import { motion } from 'framer-motion';

interface PanelNavbarProps {
  onMenuClick: () => void;
}

export default function PanelNavbar({ onMenuClick }: PanelNavbarProps) {
  return (
    <motion.header
      className="fixed top-0 left-0 w-full flex items-center h-16 px-6 bg-gradient-to-r from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md shadow-2xl border-b border-gray-700/40 z-50 transition-all duration-300"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.button
        className="text-3xl text-orange-400 hover:text-orange-300 focus:outline-none mr-4 transition-all duration-200 hover:scale-110 active:scale-95"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        &#9776;
      </motion.button>

      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-white select-none drop-shadow-lg">
          Viticos
        </span>
      </motion.div>

      <motion.span
        className="ml-6 text-gray-300 text-base hidden sm:inline font-medium"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Gestión y monitoreo del restaurante
      </motion.span>
    </motion.header>
  );
}
