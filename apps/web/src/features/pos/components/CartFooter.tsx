import React from 'react';
import { Send, Receipt, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TableItem } from '../types/pos.types';
import { Button } from '@/components/ui/button';

interface CartFooterProps {
  cartLength: number;
  subtotal: number;
  taxTotal: number;
  total: number;
  currentTable: TableItem | null;
  activeOrder: any | null;
  submitting: boolean;
  orderSentSuccess: boolean;
  isCashShiftOpen?: boolean | null;
  onSendOrder: () => void;
  onRequestCheck: () => void;
  onOpenCheckout: () => void;
}

export const CartFooter: React.FC<CartFooterProps> = ({
  cartLength,
  subtotal,
  taxTotal,
  total,
  currentTable,
  activeOrder,
  submitting,
  orderSentSuccess,
  isCashShiftOpen,
  onSendOrder,
  onRequestCheck,
  onOpenCheckout,
}) => {
  const handleOpenShifts = () => {
    window.location.hash = '#/shifts';
  };

  const finalPayableTotal =
    Number(activeOrder?.totalPaid || 0) > 0 &&
    cartLength === 0 &&
    activeOrder?.pendingBalance !== undefined
      ? Number(activeOrder.pendingBalance)
      : total;

  return (
    <div className="pt-3 border-t border-border/80 space-y-2.5">
      {/* Actionable Cash Shift Warning */}
      {isCashShiftOpen === false && (
        <button
          type="button"
          onClick={handleOpenShifts}
          className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer group text-left shadow-2xs"
          title="Haz clic para abrir el turno de caja"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold truncate">
              Caja cerrada: abre turno [F4] para enviar pedidos.
            </span>
          </div>
          <ArrowRight className="size-3.5 shrink-0 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Bill Totals Summary */}
      <div className="space-y-1.5 text-xs bg-muted/30 p-3 rounded-xl border border-border/70">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono tabular-nums font-semibold text-foreground">
            ${subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Impuestos (INC/IVA)</span>
          <span className="font-mono tabular-nums font-semibold text-foreground">
            ${taxTotal.toLocaleString()}
          </span>
        </div>

        {Number(activeOrder?.totalPaid || 0) > 0 && (
          <div className="flex justify-between text-muted-foreground pt-1 border-t border-dashed border-border/60">
            <span>Abonos previos</span>
            <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
              -${Number(activeOrder.totalPaid).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline font-bold text-sm text-foreground pt-2 border-t border-border/70">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            {Number(activeOrder?.totalPaid || 0) > 0 ? 'Saldo a Cobrar' : 'Total'}
          </span>
          <span className="font-mono tabular-nums text-lg sm:text-xl font-black text-primary">
            ${finalPayableTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <Button
          type="button"
          disabled={cartLength === 0 || submitting || isCashShiftOpen === false}
          onClick={onSendOrder}
          title={
            isCashShiftOpen === false
              ? 'Abre turno de caja para marchar'
              : cartLength === 0
              ? 'Añade productos para marchar'
              : undefined
          }
          className={`h-11 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
            orderSentSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
          }`}
        >
          {orderSentSuccess ? (
            <CheckCircle2 className="size-4 shrink-0" strokeWidth={2.2} />
          ) : (
            <Send className="size-4 shrink-0" strokeWidth={2.2} />
          )}
          <span>
            {submitting ? 'Marchando...' : orderSentSuccess ? '¡Enviada!' : 'Marchar Comanda'}
          </span>
        </Button>

        {activeOrder ? (
          <Button
            type="button"
            onClick={onOpenCheckout}
            className="h-11 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
          >
            <Receipt className="size-4 shrink-0" strokeWidth={2.2} />
            <span>Cobrar Cuenta</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            disabled={!currentTable}
            onClick={onRequestCheck}
            className="h-11 px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-[0.98] cursor-pointer border-border/80 hover:bg-muted"
          >
            <Sparkles className="size-4 text-amber-500 shrink-0" strokeWidth={2} />
            <span>Pedir Pre-cuenta</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartFooter;
