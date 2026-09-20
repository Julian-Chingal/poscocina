import React from 'react';
import { SplitMode } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CheckoutSummaryProps {
  baseSubtotal: number;
  discountAmount: number;
  baseTax: number;
  tipPct: number;
  finalTotal: number;
  checkoutMode: SplitMode;
  equalSplitCount: number;
  onTipPctChange: (pct: number) => void;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  baseSubtotal,
  discountAmount,
  baseTax,
  tipPct,
  finalTotal,
  checkoutMode,
  equalSplitCount,
  onTipPctChange,
}) => {
  return (
    <Card className="p-3.5 bg-slate-800/80 rounded-2xl border-slate-700/60 mb-4 space-y-1.5 text-xs">
      <div className="flex justify-between text-slate-400">
        <span>Subtotal:</span>
        <span className="font-mono text-slate-200">${baseSubtotal.toLocaleString()}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-rose-400">
          <span>Descuento:</span>
          <span className="font-mono">-${discountAmount.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between text-slate-400">
        <span>Impuestos:</span>
        <span className="font-mono text-slate-200">${baseTax.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-slate-400 items-center">
        <span>Propina:</span>
        <div className="flex space-x-1">
          {[0, 5, 10].map((pct) => (
            <Button
              key={pct}
              variant={tipPct === pct ? 'default' : 'secondary'}
              size="sm"
              type="button"
              onClick={() => onTipPctChange(pct)}
              className={`h-6 px-2 text-[10px] font-bold ${
                tipPct === pct ? 'bg-orange-600 text-white hover:bg-orange-500' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {pct}%
            </Button>
          ))}
        </div>
      </div>
      <Separator className="bg-slate-700 my-1" />
      <div className="flex justify-between text-base font-extrabold text-white">
        <span>{checkoutMode === 'equal' ? `Parte (1 de ${equalSplitCount}):` : 'Total a Pagar:'}</span>
        <span className="font-mono text-orange-400">${finalTotal.toLocaleString()}</span>
      </div>
    </Card>
  );
};
