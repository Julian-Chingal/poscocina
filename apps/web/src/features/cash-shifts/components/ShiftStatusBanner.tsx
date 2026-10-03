import React from 'react';
import { Coins, Clock, Printer, User, ArrowRight, ShoppingCart } from 'lucide-react';
import { ActiveShiftInfo } from '../types/cash-shifts.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  shift: NonNullable<ActiveShiftInfo['shift']>;
  onPrintSummary: () => void;
}

export const ShiftStatusBanner: React.FC<Props> = ({ shift, onPrintSummary }) => {
  const openingAmountNum = parseFloat(shift.openingAmount || '0');

  const handleGoToPos = () => {
    window.location.hash = '#/pos';
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-6 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/25">
          <Coins className="size-6" />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-foreground">
              Turno de Caja Activo
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operativo</span>
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3 text-muted-foreground" />
              <span>Iniciado: {new Date(shift.openedAt).toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}</span>
            </div>
            {shift.openedByName && (
              <div className="flex items-center gap-1">
                <span>•</span>
                <User className="size-3 text-muted-foreground" />
                <span>Cajero: <strong className="text-foreground">{shift.openedByName}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
        <div className="text-left lg:text-right pr-2">
          <span className="text-[11px] text-muted-foreground font-semibold block uppercase tracking-wider">
            Fondo Inicial (Base):
          </span>
          <span className="text-lg sm:text-xl font-black text-foreground font-mono tabular-nums">
            ${openingAmountNum.toLocaleString()} <span className="text-xs text-muted-foreground font-sans">COP</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onPrintSummary}
            className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted cursor-pointer shadow-2xs"
            title="Imprimir resumen Z parcial del turno en impresora térmica"
          >
            <Printer className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Imprimir Resumen Z</span>
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={handleGoToPos}
            className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-2xs"
            title="Ir al Punto de Venta (F2)"
          >
            <ShoppingCart className="size-3.5" />
            <span>Cobrar en POS</span>
            <ArrowRight className="size-3.5 hidden sm:inline" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftStatusBanner;
