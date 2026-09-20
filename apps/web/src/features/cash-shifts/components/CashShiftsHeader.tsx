import React from 'react';
import { ReceiptText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  isShiftOpen: boolean;
  onOpenCloseModal: () => void;
}

export const CashShiftsHeader: React.FC<Props> = ({ isShiftOpen, onOpenCloseModal }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
    <div>
      <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
        <ReceiptText className="w-3.5 h-3.5" />
        <span>Finanzas & Turnos</span>
      </div>
      <h2 className="text-2xl font-extrabold text-white tracking-tight">
        Control de Caja y Arqueo de Turnos
      </h2>
      <p className="text-sm text-slate-400 mt-0.5">
        Apertura de turno, auditoría ciega y conciliación de medios de pago.
      </p>
    </div>

    {isShiftOpen && (
      <Button
        variant="destructive"
        onClick={onOpenCloseModal}
        className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 h-auto rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
      >
        <Lock className="w-4 h-4" />
        <span>Cerrar Turno (Arqueo Ciego)</span>
      </Button>
    )}
  </div>
);
