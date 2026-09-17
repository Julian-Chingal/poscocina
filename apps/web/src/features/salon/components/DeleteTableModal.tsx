import React from 'react';
import { Trash2 } from 'lucide-react';
import { TableItem } from '../types/salon.types';

interface Props {
  deleteTarget: TableItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteTableModal: React.FC<Props> = ({
  deleteTarget,
  submitting,
  onClose,
  onConfirm,
}) => {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">¿Eliminar Mesa?</h3>
        <p className="text-xs text-slate-400 mb-6">
          Estás a punto de eliminar <span className="text-white font-semibold">"{deleteTarget.label}"</span>. Esta acción quitará la mesa del salón.
        </p>

        <div className="flex space-x-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};
