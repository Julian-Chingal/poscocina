import React from 'react';
import { DollarSign, CreditCard, Send } from 'lucide-react';
import { PaymentMethod } from '../types/pos.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
            <Button
              key={id}
              variant="ghost"
              type="button"
              onClick={() => onPaymentMethodChange(id)}
              className={`h-auto p-2.5 rounded-xl border flex flex-col items-center space-y-1 ${
                paymentMethod === id
                  ? 'bg-primary/15 border-primary text-primary hover:bg-primary/20 hover:text-primary'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {paymentMethod === 'cash' && (
        <Card className="p-3 bg-muted/40 rounded-2xl border-border mb-4 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Efectivo Entregado:</span>
            <Input
              type="number"
              value={cashTendered}
              onChange={(e) => onCashTenderedChange(e.target.value)}
              placeholder={finalTotal.toString()}
              className="w-36 h-8 text-right font-mono"
            />
          </div>
          {tenderedNum > 0 && (
            <>
              <Separator className="my-1" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vueltas:</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ${changeDue.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </Card>
      )}

      {paymentMethod !== 'cash' && (
        <Input
          type="text"
          placeholder="Número de Aprobación / Referencia"
          value={cardReference}
          onChange={(e) => onCardReferenceChange(e.target.value)}
          className="w-full mb-4"
        />
      )}
    </>
  );
};
