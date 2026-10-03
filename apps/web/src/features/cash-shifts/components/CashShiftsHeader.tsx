import React from 'react';
import { ReceiptText, Lock, AlertTriangle, ShieldCheck, KeyRound, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  isShiftOpen: boolean;
  onOpenCloseModal: () => void;
  onOpenDrawer?: () => void;
  onPrintSummary?: () => void;
}

export const CashShiftsHeader: React.FC<Props> = ({
  isShiftOpen,
  onOpenCloseModal,
  onOpenDrawer,
  onPrintSummary,
}) => (
  <header className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 border-primary/20 gap-1.5 px-2.5 py-0.5"
        >
          <ReceiptText className="size-3.5" />
          <span>Finanzas & Control Operativo</span>
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
        <span className="text-xs text-muted-foreground hidden sm:inline flex items-center gap-1">
          <ShieldCheck className="size-3 text-emerald-500" />
          Auditoría ciega activa
        </span>
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
        Control de Caja y Arqueo de Turnos
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
        Gestión de apertura de caja, registro de base de cambio, cobros y conciliación ciega de medios de pago.
      </p>
    </div>

    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
      {isShiftOpen ? (
        <>
          {onOpenDrawer && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onOpenDrawer}
              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted cursor-pointer shadow-2xs"
              title="Enviar comando para abrir cajón monedero"
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Abrir Cajón</span>
            </Button>
          )}

          {onPrintSummary && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onPrintSummary}
              className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-border/80 hover:bg-muted cursor-pointer shadow-2xs"
              title="Imprimir resumen Z parcial del turno"
            >
              <Printer className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Resumen Z</span>
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={onOpenCloseModal}
            className="flex items-center gap-2 px-3.5 py-2 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Lock className="size-3.5" />
            <span>Cerrar Turno (Arqueo)</span>
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold shadow-2xs">
          <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Caja Cerrada · Pendiente Apertura</span>
        </div>
      )}
    </div>
  </header>
);

export default CashShiftsHeader;
