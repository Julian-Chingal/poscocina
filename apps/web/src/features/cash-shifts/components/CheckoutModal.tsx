import React, { useState } from 'react';
import { X, Sparkles, DollarSign, CreditCard, Send, Receipt } from 'lucide-react';
import { PendingBill, PaymentMethod } from '../types/cash-shifts.types';
import { CheckoutBreakdown } from './CheckoutBreakdown';

interface Props {
  bill: PendingBill;
  isProcessing: boolean;
  onClose: () => void;
  onConfirmPayment: (
    method: PaymentMethod,
    total: number,
    tipAmount: number,
    reference?: string
  ) => Promise<void>;
}

export const CheckoutModal: React.FC<Props> = ({
  bill,
  isProcessing,
  onClose,
  onConfirmPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [cardReference, setCardReference] = useState('');
  const [tipPct, setTipPct] = useState(0);

  const billSubtotal = parseFloat(bill.subtotal || '0');
  const billTax = parseFloat(bill.taxTotal || '0');
  const tipAmount = (billSubtotal * tipPct) / 100;
  const billTotal = billSubtotal + billTax + tipAmount;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - billTotal);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Caja & Facturación Directa</span>
        </div>
        <h3 className="text-xl font-black text-white">Cobro de Cuenta</h3>
        <p className="text-xs text-slate-400 mb-5">
          {bill.table ? bill.table.label : 'Para Llevar'} • Orden #{bill.orderNumber || bill.id.slice(0, 6)}
        </p>

        <CheckoutBreakdown
          subtotal={billSubtotal}
          taxTotal={billTax}
          tipAmount={tipAmount}
          tipPct={tipPct}
          billTotal={billTotal}
          onTipPctChange={setTipPct}
        />

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Medio de Pago:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash' as const, label: 'Efectivo', icon: DollarSign, active: 'bg-emerald-950/60 border-emerald-500 text-emerald-400' },
              { id: 'card_credit' as const, label: 'Tarjeta', icon: CreditCard, active: 'bg-blue-950/60 border-blue-500 text-blue-400' },
              { id: 'transfer' as const, label: 'Transferencia', icon: Send, active: 'bg-purple-950/60 border-purple-500 text-purple-400' },
            ].map(({ id, label, icon: Icon, active }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaymentMethod(id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  paymentMethod === id ? `${active} shadow-sm` : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'cash' && (
          <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 mb-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Efectivo Entregado:</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">$</span>
              <input
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder={billTotal.toString()}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              {[billTotal, Math.ceil(billTotal / 10000) * 10000, Math.ceil(billTotal / 50000) * 50000].map((val, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCashTendered(val.toString())}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700 cursor-pointer"
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>

            {tenderedNum > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/60 text-xs">
                <span className="text-slate-400">Cambio / Vueltas:</span>
                <span className="text-sm font-black font-mono text-emerald-400">${changeDue.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {paymentMethod !== 'cash' && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Referencia / Aprobación:</label>
            <input
              type="text"
              placeholder="Ej. 987452 o Nequi M1234"
              value={cardReference}
              onChange={(e) => setCardReference(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none font-mono"
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing || (paymentMethod === 'cash' && tenderedNum > 0 && tenderedNum < billTotal)}
            onClick={() => onConfirmPayment(paymentMethod, billTotal, tipAmount, cardReference)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-600/20 cursor-pointer flex items-center space-x-2 disabled:bg-slate-800 disabled:text-slate-600"
          >
            <Receipt className="w-4 h-4" />
            <span>{isProcessing ? 'Emitiendo...' : 'Confirmar y Facturar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
