import React from 'react';
import { Send, Receipt, Sparkles } from 'lucide-react';
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
  onSendOrder,
  onRequestCheck,
  onOpenCheckout,
}) => {
  return (
    <div className="pt-3 border-t border-border space-y-2.5">
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal:</span>
          <span className="font-mono text-foreground">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Impuestos:</span>
          <span className="font-mono text-foreground">${taxTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-extrabold text-sm text-foreground pt-1 border-t border-border">
          <span>Total Comanda:</span>
          <span className="font-mono text-primary">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          type="button"
          disabled={cartLength === 0 || submitting}
          onClick={onSendOrder}
          className={`h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
            orderSentSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Marchando...' : orderSentSuccess ? '¡Enviada!' : 'Marchar'}</span>
        </Button>

        {activeOrder ? (
          <Button
            type="button"
            onClick={onOpenCheckout}
            className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-600/20"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Cobrar Cuenta</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            disabled={!currentTable}
            onClick={onRequestCheck}
            className="h-10 px-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pedir Cuenta</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartFooter;
