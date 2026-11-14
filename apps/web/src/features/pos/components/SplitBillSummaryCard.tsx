import React from 'react';
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SplitBillSummaryCardProps {
  orderTotal: number;
  totalCovered: number;
  remainingBalance: number;
  subtotal?: number;
  discountTotal?: number;
  tipTotal?: number;
}

export const SplitBillSummaryCard: React.FC<SplitBillSummaryCardProps> = ({
  orderTotal,
  totalCovered,
  remainingBalance,
  discountTotal = 0,
  tipTotal = 0,
}) => {
  const isZeroRemaining = Math.abs(remainingBalance) < 0.01;
  const isOverpaid = remainingBalance < -0.01;
  const isUnderpaid = remainingBalance > 0.01;

  return (
    <Card className="p-4 bg-muted/30 border-border/80 shadow-2xs rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
        {/* Total a pagar */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total a Cubrir
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black font-mono text-foreground">
              ${orderTotal.toLocaleString()}
            </span>
            {(discountTotal > 0 || tipTotal > 0) && (
              <span className="text-[10px] text-muted-foreground">
                {discountTotal > 0 && `(Desc: -$${discountTotal.toLocaleString()})`}
                {tipTotal > 0 && ` (Propina: +$${tipTotal.toLocaleString()})`}
              </span>
            )}
          </div>
        </div>

        {/* Total asignado */}
        <div className="pt-2 sm:pt-0 sm:pl-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block">
            Total Asignado
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black font-mono text-primary">
              ${totalCovered.toLocaleString()}
            </span>
            <Badge variant="outline" className="text-xs font-mono font-bold px-2 py-0.5">
              {orderTotal > 0 ? Math.round((totalCovered / orderTotal) * 100) : 0}%
            </Badge>
          </div>
        </div>

        {/* Saldo Restante */}
        <div className="pt-2 sm:pt-0 sm:pl-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Saldo Restante
            </span>
            {isZeroRemaining && (
              <Badge
                variant="outline"
                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1 px-2.5 py-0.5"
              >
                <CheckCircle2 className="size-3.5" />
                Completo
              </Badge>
            )}
            {isUnderpaid && (
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-bold gap-1 px-2.5 py-0.5"
              >
                <Scale className="size-3.5" />
                Pendiente
              </Badge>
            )}
            {isOverpaid && (
              <Badge variant="destructive" className="text-xs font-bold gap-1 px-2.5 py-0.5">
                <AlertTriangle className="size-3.5" />
                Excedido
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-black font-mono ${
                isZeroRemaining
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isOverpaid
                  ? 'text-destructive'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              ${Math.abs(remainingBalance).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {isZeroRemaining
                ? 'Cuenta balanceada (exacta)'
                : isOverpaid
                ? 'El total asignado supera la cuenta'
                : 'Falta asignar al pago'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
