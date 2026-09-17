import React from 'react';
import { Send, Receipt, Sparkles } from 'lucide-react';
import { TableItem } from '../types/pos.types';

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
    <div className="pt-3 border-t border-slate-700/60 space-y-2.5">
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal:</span>
          <span className="font-mono text-slate-200">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Impuestos:</span>
          <span className="font-mono text-slate-200">${taxTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-extrabold text-sm text-white pt-1 border-t border-slate-700/60">
          <span>Total Comanda:</span>
          <span className="font-mono text-orange-400">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          disabled={cartLength === 0 || submitting}
          onClick={onSendOrder}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            orderSentSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-orange-600 hover:bg-orange-500 text-white disabled:bg-slate-800 disabled:text-slate-600'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Marchando...' : orderSentSuccess ? '¡Enviada!' : 'Marchar'}</span>
        </button>

        {activeOrder ? (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Cobrar Cuenta</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={!currentTable}
            onClick={onRequestCheck}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pedir Cuenta</span>
          </button>
        )}
      </div>
    </div>
  );
};
