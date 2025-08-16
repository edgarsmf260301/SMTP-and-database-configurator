import React from 'react';
import { motion } from 'framer-motion';

interface FooterProps {
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Footer({ showLogout = false, onLogout }: FooterProps) {
  return (
    <motion.footer
      className="mt-12 text-center select-none flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showLogout && (
        <motion.button
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-red-500/25 border border-red-500/30 hover:scale-105 active:scale-95"
          onClick={onLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </div>
        </motion.button>
      )}

      <div className="flex flex-col items-center gap-2">
        <span className="text-gray-400 text-sm">
          © 2025 Sistema de Restaurante{' '}
          <a
            href="https://my-portfolio-lime-zeta-70.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200 hover:underline"
          >
            Edgar Martinez
          </a>
        </span>
        <span className="text-gray-500 text-xs">
          Desarrollador Web Full Stack
        </span>
      </div>
    </motion.footer>
  );
}
