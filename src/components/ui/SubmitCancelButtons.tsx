import React from 'react';

interface SubmitCancelButtonsProps {
  onCancel: () => void;
  saving: boolean;
  disabled: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

const SubmitCancelButtons: React.FC<SubmitCancelButtonsProps> = ({
  onCancel,
  saving,
  disabled,
  submitLabel = 'Guardar Cambios',
  cancelLabel = 'Cancelar',
}) => {
  return (
    <div className="flex gap-3">
      <button
        type="submit"
        disabled={disabled || saving}
        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
      >
        {saving ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Guardando...
          </div>
        ) : (
          submitLabel
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700/80 text-gray-200 rounded-xl font-bold border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
      >
        {cancelLabel}
      </button>
    </div>
  );
};

export default SubmitCancelButtons;
