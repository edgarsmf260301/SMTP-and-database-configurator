import React from "react";

interface SubmitCancelButtonsProps {
  onCancel: () => void;
  saving: boolean;
  disabled: boolean;
  submitLabel?: string;
}

const SubmitCancelButtons: React.FC<SubmitCancelButtonsProps> = ({ onCancel, saving, disabled, submitLabel }) => (
  <div className="flex gap-3 mt-2 flex-col sm:flex-row">
    <button
      type="submit"
      disabled={disabled}
      className={
        `bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg w-full sm:w-auto ` +
        `hover:scale-105 active:scale-95 ` +
        `disabled:opacity-60 disabled:cursor-not-allowed ` +
        (disabled ? 'opacity-60 cursor-not-allowed' : '')
      }
    >
  {saving ? "Guardando..." : (submitLabel || "Registrar")}
    </button>
    <button type="button" onClick={onCancel} className="bg-gray-700 text-gray-200 px-6 py-2 rounded-xl font-bold shadow transition-all duration-300 text-lg hover:bg-gray-600 w-full sm:w-auto">
      Cancelar
    </button>
  </div>
);

export default SubmitCancelButtons;
