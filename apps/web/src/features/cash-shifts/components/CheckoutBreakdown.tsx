import React from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
    <Card className="p-4 bg-muted/40 rounded-2xl border-border mb-5 space-y-2 text-xs">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal alimentos y bebidas:</span>
        <span className="font-mono text-foreground">${subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>{taxLabel}</span>
        <span className="font-mono text-foreground">${taxTotal.toLocaleString()}</span>
      </div>
      <Separator className="my-1" />
      <div className="flex justify-between text-muted-foreground items-center">
        <span className="flex items-center space-x-2">
          <span>Propina Voluntaria:</span>
          <div className="flex space-x-1">
            {[0, 5, 10].map((pct) => (
              <Button
                key={pct}
                type="button"
                size="sm"
                variant={tipPct === pct ? 'default' : 'secondary'}
                onClick={() => onTipPctChange(pct)}
                className={`h-6 px-2 text-[10px] font-bold cursor-pointer transition-colors ${
                  tipPct === pct ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {pct}%
              </Button>
            ))}
          </div>
        </span>
        <span className="font-mono text-foreground">${tipAmount.toLocaleString()}</span>
      </div>
      <Separator className="my-1.5" />
      <div className="flex justify-between text-base font-extrabold text-foreground">
        <span>Total a Cobrar:</span>
        <span className="font-mono text-primary">${billTotal.toLocaleString()}</span>
      </div>
    </Card>
  );
};
