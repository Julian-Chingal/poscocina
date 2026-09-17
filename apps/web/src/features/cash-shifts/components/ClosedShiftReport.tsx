import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CloseShiftReportData } from '../types/cash-shifts.types';

interface Props {
  report: CloseShiftReportData;
  onDismiss: () => void;
}

export const ClosedShiftReport: React.FC<Props> = ({ report, onDismiss }) => {
  const diff = report.difference ?? 0;

  return (
    <div className="max-w-xl mx-auto bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-white">Arqueo de Turno Finalizado</h3>
        <p className="text-xs text-slate-400 mt-0.5">El turno de caja ha sido cerrado con éxito.</p>
      </div>

      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Efectivo Esperado (Fondo + Ventas):</span>
          <span className="font-mono text-white">${report.expected?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Efectivo Físico Contado (Arqueo ciego):</span>
          <span className="font-mono text-white">${report.actual?.toLocaleString()}</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
          <span>Diferencia de Caja:</span>
          <span
            className={`font-mono ${
              diff === 0
                ? 'text-emerald-400'
                : diff > 0
                ? 'text-cyan-400'
                : 'text-rose-400'
            }`}
          >
            {diff === 0
              ? '$0 (Caja Cuadrada)'
              : diff > 0
              ? `+$${diff.toLocaleString()} (Sobrante)`
              : `-$${Math.abs(diff).toLocaleString()} (Faltante)`}
          </span>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
      >
        Entendido / Continuar
      </button>
    </div>
  );
};
