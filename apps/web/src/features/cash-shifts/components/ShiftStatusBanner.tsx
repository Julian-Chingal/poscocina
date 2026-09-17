import React from 'react';
import { Coins, Clock, Printer } from 'lucide-react';
import { ActiveShiftInfo } from '../types/cash-shifts.types';

interface Props {
  shift: NonNullable<ActiveShiftInfo['shift']>;
  onPrintSummary: () => void;
}

export const ShiftStatusBanner: React.FC<Props> = ({ shift, onPrintSummary }) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <Coins className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-black text-white">Turno de Caja Activo</span>
          <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full uppercase">
            Abierto
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Iniciado: {new Date(shift.openedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={onPrintSummary}
        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
      >
        <Printer className="w-3.5 h-3.5 text-orange-400" />
        <span>Imprimir Resumen Z</span>
      </button>

      <div className="text-right">
        <span className="text-xs text-slate-400 block">Fondo Inicial de Caja:</span>
        <span className="text-xl font-black text-white font-mono">
          ${parseFloat(shift.openingAmount || '0').toLocaleString()}
        </span>
      </div>
    </div>
  </div>
);
