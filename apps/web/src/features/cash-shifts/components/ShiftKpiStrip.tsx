import React from 'react';
import { Coins, TrendingUp, Banknote, ReceiptText } from 'lucide-react';

interface Props {
  openingAmount: number;
  openedAt: string;
  cashierName?: string;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  totalSales: number;
  pendingBillsCount: number;
  pendingBillsTotal: number;
}

export const ShiftKpiStrip: React.FC<Props> = ({
  openingAmount,
  openedAt,
  cashierName,
  cashSales,
  totalSales,
  pendingBillsCount,
  pendingBillsTotal,
}) => {
  const estimatedCashInDrawer = openingAmount + cashSales;

  const formattedOpenedAt = new Date(openedAt).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Base Inicial */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Base Inicial
          </span>
          <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-foreground">
            ${openingAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {cashierName ? `Por ${cashierName}` : 'Apertura'} a las {formattedOpenedAt}
          </p>
        </div>
      </div>

      {/* 2. Total Facturado en Turno */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Ventas Cobradas
          </span>
          <div className="size-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-foreground">
            ${totalSales.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Recaudado en todos los medios
          </p>
        </div>
      </div>

      {/* 3. Efectivo Estimado en Gaveta */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2 ring-1 ring-amber-500/20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Efectivo en Cajón
          </span>
          <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Banknote className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400">
            ${estimatedCashInDrawer.toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Base + ${cashSales.toLocaleString()} efectivo
          </p>
        </div>
      </div>

      {/* 4. Cuentas Pendientes en Salón */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Por Cobrar en Mesas
          </span>
          <div className="size-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ReceiptText className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-foreground">
            {pendingBillsCount} <span className="text-xs font-sans font-semibold text-muted-foreground">{pendingBillsCount === 1 ? 'cuenta' : 'cuentas'}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-mono font-semibold">
            ${pendingBillsTotal.toLocaleString()} pendiente
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShiftKpiStrip;
