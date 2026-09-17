import React, { useState, FormEvent } from 'react';
import { Unlock } from 'lucide-react';

interface Props {
  onOpenShift: (amount: number, notes?: string) => Promise<void>;
}

export const OpenShiftCard: React.FC<Props> = ({ onOpenShift }) => {
  const [openingAmount, setOpeningAmount] = useState('100000');
  const [openingNotes, setOpeningNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onOpenShift(parseFloat(openingAmount) || 0, openingNotes);
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800/60 border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
        <Unlock className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-white tracking-tight">
        Apertura de Turno de Caja
      </h3>
      <p className="text-xs text-slate-400 mt-1 mb-6">
        Inicia el turno ingresando el fondo de caja inicial en efectivo (base de cambio).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Fondo Inicial en Efectivo:
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">
              $
            </span>
            <input
              type="number"
              required
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Observaciones de Apertura:
          </label>
          <input
            type="text"
            placeholder="Ej. Billetes de baja denominación para cambio"
            value={openingNotes}
            onChange={(e) => setOpeningNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Abriendo turno...' : 'Abrir Turno de Caja'}
        </button>
      </form>
    </div>
  );
};
