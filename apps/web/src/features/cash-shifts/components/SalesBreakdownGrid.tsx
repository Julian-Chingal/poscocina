import React from 'react';
import { DollarSign, CreditCard, Send, Wallet, KeyRound, Printer, ShoppingCart, Users, ShieldAlert } from 'lucide-react';
import { ActiveShiftInfo } from '../types/cash-shifts.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
  salesByMethod?: ActiveShiftInfo['salesByMethod'];
  onOpenDrawer?: () => void;
  onPrintSummary?: () => void;
}

export const SalesBreakdownGrid: React.FC<Props> = ({
  salesByMethod = [],
  onOpenDrawer,
  onPrintSummary,
}) => {
  const cashData = salesByMethod.find((m) => m.method === 'cash');
  const cashTotal = parseFloat(cashData?.total || '0');

  const cardData = salesByMethod.filter((m) => ['card_credit', 'card_debit'].includes(m.method));
  const cardTotal = cardData.reduce((sum, c) => sum + parseFloat(c.total || '0'), 0);

  const transferData = salesByMethod.find((m) => m.method === 'transfer');
  const transferTotal = parseFloat(transferData?.total || '0');

  const grandTotal = cashTotal + cardTotal + transferTotal;

  const cashPercent = grandTotal > 0 ? Math.round((cashTotal / grandTotal) * 100) : 0;
  const cardPercent = grandTotal > 0 ? Math.round((cardTotal / grandTotal) * 100) : 0;
  const transferPercent = grandTotal > 0 ? Math.round((transferTotal / grandTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Sales by Payment Method Card */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Wallet className="size-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider">
                Recaudación por Medios
              </h3>
              <span className="text-[11px] text-muted-foreground block">
                Conciliación del turno en curso
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-xs font-mono font-black tabular-nums bg-primary/10 text-primary border-primary/25 px-2.5 py-0.5"
          >
            ${grandTotal.toLocaleString()} COP
          </Badge>
        </div>

        {/* Visual Mini Progress Bar */}
        {grandTotal > 0 && (
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted flex overflow-hidden">
              {cashPercent > 0 && (
                <div
                  style={{ width: `${cashPercent}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Efectivo: ${cashPercent}%`}
                />
              )}
              {cardPercent > 0 && (
                <div
                  style={{ width: `${cardPercent}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Tarjetas: ${cardPercent}%`}
                />
              )}
              {transferPercent > 0 && (
                <div
                  style={{ width: `${transferPercent}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Transferencias: ${transferPercent}%`}
                />
              )}
            </div>
          </div>
        )}

        {/* Method Rows */}
        <div className="space-y-2.5">
          {/* Cash */}
          <div className="p-3 bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <DollarSign className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Efectivo</span>
                <span className="text-[10px] text-muted-foreground font-medium">En gaveta física</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono tabular-nums text-foreground block">
                ${cashTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {cashPercent}% del total
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="p-3 bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                <CreditCard className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Tarjetas (Datáfono)</span>
                <span className="text-[10px] text-muted-foreground font-medium">Débito y Crédito</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono tabular-nums text-foreground block">
                ${cardTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {cardPercent}% del total
              </span>
            </div>
          </div>

          {/* Transfers */}
          <div className="p-3 bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                <Send className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Transferencias</span>
                <span className="text-[10px] text-muted-foreground font-medium">Nequi / Daviplata / QR</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono tabular-nums text-foreground block">
                ${transferTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {transferPercent}% del total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal & Hardware Actions Card */}
      <div className="bg-card/90 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Acciones de Estación y Hardware
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {onOpenDrawer && (
            <Button
              variant="outline"
              type="button"
              onClick={onOpenDrawer}
              className="h-10 text-xs font-bold rounded-xl gap-2 border-border/80 hover:bg-muted cursor-pointer justify-start px-3"
            >
              <KeyRound className="size-3.5 text-primary" />
              <span>Abrir Cajón</span>
            </Button>
          )}

          {onPrintSummary && (
            <Button
              variant="outline"
              type="button"
              onClick={onPrintSummary}
              className="h-10 text-xs font-bold rounded-xl gap-2 border-border/80 hover:bg-muted cursor-pointer justify-start px-3"
            >
              <Printer className="size-3.5 text-primary" />
              <span>Imprimir Z</span>
            </Button>
          )}

          <Button
            variant="outline"
            type="button"
            onClick={() => { window.location.hash = '#/pos'; }}
            className="h-10 text-xs font-bold rounded-xl gap-2 border-border/80 hover:bg-muted cursor-pointer justify-start px-3"
          >
            <ShoppingCart className="size-3.5 text-primary" />
            <span>POS [F2]</span>
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => { window.location.hash = '#/salon'; }}
            className="h-10 text-xs font-bold rounded-xl gap-2 border-border/80 hover:bg-muted cursor-pointer justify-start px-3"
          >
            <Users className="size-3.5 text-primary" />
            <span>Mesas [F1]</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesBreakdownGrid;
