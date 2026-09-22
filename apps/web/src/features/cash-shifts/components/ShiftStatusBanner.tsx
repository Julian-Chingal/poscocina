import React from 'react';
import { Coins, Clock, Printer } from 'lucide-react';
import { ActiveShiftInfo } from '../types/cash-shifts.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  shift: NonNullable<ActiveShiftInfo['shift']>;
  onPrintSummary: () => void;
}

export const ShiftStatusBanner: React.FC<Props> = ({ shift, onPrintSummary }) => (
  <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <Coins className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-black text-foreground">Turno de Caja Activo</span>
          <Badge variant="success" className="text-[10px] font-bold uppercase">
            Abierto
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Iniciado: {new Date(shift.openedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        type="button"
        onClick={onPrintSummary}
        className="px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-sm h-auto"
      >
        <Printer className="w-3.5 h-3.5 text-primary" />
        <span>Imprimir Resumen Z</span>
      </Button>

      <div className="text-right">
        <span className="text-xs text-muted-foreground block">Fondo Inicial de Caja:</span>
        <span className="text-xl font-black text-foreground font-mono">
          ${parseFloat(shift.openingAmount || '0').toLocaleString()}
        </span>
      </div>
    </div>
  </Card>
);
