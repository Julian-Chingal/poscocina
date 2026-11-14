import React from 'react';
import { Coins, TrendingUp, Banknote, ReceiptText, Eye, EyeOff } from 'lucide-react';

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
  hideSensitiveAmounts?: boolean;
  onToggleHideAmounts?: () => void;
}

export const ShiftKpiStrip: React.FC<Props> = ({
  openingAmount,
  openedAt,
  cashierName,
  cashSales,
  totalSales,
  pendingBillsCount,
  pendingBillsTotal,
  hideSensitiveAmounts = true,
  onToggleHideAmounts,
}) => {
  const estimatedCashInDrawer = openingAmount + cashSales;

  const formattedOpenedAt = new Date(openedAt).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const maskAmount = (val: number) => (hideSensitiveAmounts ? '$ ••••••' : `$${val.toLocaleString()}`);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Base Inicial */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2 relative group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Base Inicial
          </span>
          <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-foreground flex items-center gap-2">
            <span>{maskAmount(openingAmount)}</span>
            {onToggleHideAmounts && (
              <button
                type="button"
                onClick={onToggleHideAmounts}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                title={hideSensitiveAmounts ? 'Mostrar cifras' : 'Ocultar cifras'}
              >
                {hideSensitiveAmounts ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {cashierName ? `Por ${cashierName}` : 'Apertura'} a las {formattedOpenedAt}
          </p>
        </div>
      </div>

      {/* 2. Total Facturado en Turno */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2 relative group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Ventas Cobradas
          </span>
          <div className="size-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-foreground flex items-center gap-2">
            <span>{maskAmount(totalSales)}</span>
            {onToggleHideAmounts && (
              <button
                type="button"
                onClick={onToggleHideAmounts}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                title={hideSensitiveAmounts ? 'Mostrar cifras' : 'Ocultar cifras'}
              >
                {hideSensitiveAmounts ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {hideSensitiveAmounts ? 'Cifra protegida por seguridad' : 'Recaudado en todos los medios'}
          </p>
        </div>
      </div>

      {/* 3. Efectivo Estimado en Gaveta (TOTAL EN CAJA) */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-2 ring-1 ring-amber-500/20 relative group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Efectivo en Cajón
          </span>
          <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Banknote className="size-4" />
          </div>
        </div>

        <div>
          <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <span>{maskAmount(estimatedCashInDrawer)}</span>
            {onToggleHideAmounts && (
              <button
                type="button"
                onClick={onToggleHideAmounts}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-amber-500 cursor-pointer"
                title={hideSensitiveAmounts ? 'Mostrar total en caja' : 'Ocultar total en caja'}
              >
                {hideSensitiveAmounts ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {hideSensitiveAmounts ? 'Oculto por auditoría ciega' : `Base + $${cashSales.toLocaleString()} efectivo`}
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
            {maskAmount(pendingBillsTotal)} pendiente
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShiftKpiStrip;
