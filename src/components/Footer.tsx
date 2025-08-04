import React from "react";

interface FooterProps {
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Footer({ showLogout = false, onLogout }: FooterProps) {
  return (
    <footer className="mt-12 text-xs text-gray-400 text-center select-none flex flex-col items-center gap-2">
      {showLogout && (
        <button
          className="text-red-400 hover:text-red-300 font-semibold text-base transition-colors flex items-center gap-2"
          onClick={onLogout}
        >
          Cerrar Sesión
        </button>
      )}
      <span>
        © 2025 Sistema de Restaurante{' '}
        <a
          href="https://my-portfolio-lime-zeta-70.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline font-semibold transition-colors"
        >
          Edgar Martinez - Desarrollador Web
        </a>
      </span>
    </footer>
  );
}
