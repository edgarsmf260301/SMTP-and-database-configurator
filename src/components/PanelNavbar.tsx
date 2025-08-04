import React from "react";

interface PanelNavbarProps {
  onMenuClick: () => void;
}

export default function PanelNavbar({ onMenuClick }: PanelNavbarProps) {
  return (
    <header className="fixed top-0 left-0 w-full flex items-center h-16 px-6 bg-[#151c28]/80 backdrop-blur-md shadow z-50 transition-all duration-300">
      <button
        className="text-3xl text-orange-500 focus:outline-none mr-4"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        &#9776;
      </button>
      <span className="text-2xl font-bold text-white select-none">Viticos</span>
      <span className="ml-6 text-gray-300 text-base hidden sm:inline">Gestión y monitoreo del restaurante</span>
    </header>
  );
}
