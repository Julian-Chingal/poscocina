import React, { useState, FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClose: (amount: number, notes?: string) => Promise<void>;
}

export const CloseShiftModal: React.FC<Props> = ({ isOpen, onClose, onConfirmClose }) => {
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onConfirmClose(parseFloat(closingAmount) || 0, closingNotes);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase mb-1">
          <AlertCircle className="w-4 h-4" />
          <span>Auditoría de Cierre</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Arqueo Ciego de Caja</h3>
        <p className="text-xs text-slate-400 mb-5">
          Ingresa el total de dinero en efectivo físico contado en la gaveta. Por seguridad, el
          sistema no muestra el total recaudado hasta confirmar el conteo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Efectivo Físico Contado:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
              <input
                type="number"
                required
                placeholder="0"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notas de Cierre:
            </label>
            <input
              type="text"
              placeholder="Ej. Billetes desgastados o cambio exacto"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Cerrando...' : 'Confirmar y Cerrar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
