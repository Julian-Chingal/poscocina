import React from 'react';
import { DollarSign, CreditCard, Send } from 'lucide-react';
import { PaymentMethod } from '../types/pos.types';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  cashTendered: string;
  cardReference: string;
  finalTotal: number;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  onCashTenderedChange: (c: string) => void;
  onCardReferenceChange: (r: string) => void;
}

const METHODS = [
  { id: 'cash' as const, label: 'Efectivo', icon: DollarSign },
  { id: 'card_credit' as const, label: 'Tarjeta', icon: CreditCard },
  { id: 'transfer' as const, label: 'Transferencia', icon: Send },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  cashTendered,
  cardReference,
  finalTotal,
  onPaymentMethodChange,
  onCashTenderedChange,
  onCardReferenceChange,
}) => {
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - finalTotal);

  return (
    <>
      <div className="my-4">
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onPaymentMethodChange(id)}
              className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 ${
                paymentMethod === id
                  ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {paymentMethod === 'cash' && (
        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/60 mb-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Efectivo Entregado:</span>
            <input
              type="number"
              value={cashTendered}
              onChange={(e) => onCashTenderedChange(e.target.value)}
              placeholder={finalTotal.toString()}
              className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-right"
            />
          </div>
          {tenderedNum > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-slate-700/60">
              <span className="text-slate-400">Vueltas:</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                ${changeDue.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {paymentMethod !== 'cash' && (
        <input
          type="text"
          placeholder="Número de Aprobación / Referencia"
          value={cardReference}
          onChange={(e) => onCardReferenceChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs mb-4"
        />
      )}
    </>
  );
};
