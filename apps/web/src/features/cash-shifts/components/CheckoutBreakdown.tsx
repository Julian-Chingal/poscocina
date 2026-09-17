import React from 'react';
import { useBrandingStore } from '@/stores/branding.store';

interface Props {
  subtotal: number;
  taxTotal: number;
  tipAmount: number;
  tipPct: number;
  billTotal: number;
  onTipPctChange: (pct: number) => void;
}

export const CheckoutBreakdown: React.FC<Props> = ({
  subtotal,
  taxTotal,
  tipAmount,
  tipPct,
  billTotal,
  onTipPctChange,
}) => {
  const settings = useBrandingStore((s) => s.settings);
  const taxRate = typeof settings.taxRate === 'number' ? settings.taxRate : 0.08;
  const taxLabel = `${settings.taxRate === 0.19 ? 'IVA' : 'INC'} (${Math.round(taxRate * 100)}%):`;

  return (
    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5 space-y-2 text-xs">
      <div className="flex justify-between text-slate-400">
        <span>Subtotal alimentos y bebidas:</span>
        <span className="font-mono text-slate-200">${subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-slate-400">
        <span>{taxLabel}</span>
        <span className="font-mono text-slate-200">${taxTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-slate-400 items-center pt-1 border-t border-slate-700/60">
        <span className="flex items-center space-x-2">
          <span>Propina Voluntaria:</span>
          <div className="flex space-x-1">
            {[0, 5, 10].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onTipPctChange(pct)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                  tipPct === pct ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </span>
        <span className="font-mono text-slate-200">${tipAmount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700">
        <span>Total a Cobrar:</span>
        <span className="font-mono text-orange-400">${billTotal.toLocaleString()}</span>
      </div>
    </div>
  );
};
