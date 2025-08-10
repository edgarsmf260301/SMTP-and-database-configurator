import React from "react";

interface ModalHeaderProps {
  onClose: () => void;
  title: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, title }) => (
  <>
    <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none">×</button>
    <h2 className="text-2xl font-extrabold text-orange-300 mb-2 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow">
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z" />
        </svg>
      </span>
      {title}
    </h2>
  </>
);

export default ModalHeader;
