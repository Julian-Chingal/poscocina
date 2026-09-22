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
    <Card className="p-3.5 bg-muted/40 rounded-2xl border-border mb-4 space-y-1.5 text-xs">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal:</span>
        <span className="font-mono text-foreground">${baseSubtotal.toLocaleString()}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-destructive">
          <span>Descuento:</span>
          <span className="font-mono">-${discountAmount.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <span>Impuestos:</span>
        <span className="font-mono text-foreground">${baseTax.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-muted-foreground items-center">
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
                tipPct === pct ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {pct}%
            </Button>
          ))}
        </div>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between text-base font-extrabold text-foreground">
        <span>{checkoutMode === 'equal' ? `Parte (1 de ${equalSplitCount}):` : 'Total a Pagar:'}</span>
        <span className="font-mono text-primary">${finalTotal.toLocaleString()}</span>
      </div>
    </Card>
  );
};
