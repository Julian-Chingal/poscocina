import React, { useState } from 'react';
import { Sparkles, DollarSign, CreditCard, Send, Receipt } from 'lucide-react';
import { PendingBill, PaymentMethod } from '../types/cash-shifts.types';
import { CheckoutBreakdown } from './CheckoutBreakdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Props {
  bill: PendingBill | null;
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

  if (!bill) return null;

  const billSubtotal = parseFloat(bill.subtotal || '0');
  const billTax = parseFloat(bill.taxTotal || '0');
  const tipAmount = (billSubtotal * tipPct) / 100;
  const billTotal = billSubtotal + billTax + tipAmount;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - billTotal);
  const isCashInvalid = paymentMethod === 'cash' && tenderedNum > 0 && tenderedNum < billTotal;

  return (
    <Dialog open={Boolean(bill)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Caja & Facturación Directa</span>
          </div>
          <DialogTitle className="text-xl font-black">Cobro de Cuenta</DialogTitle>
          <DialogDescription>
            {bill.table ? bill.table.label : 'Para Llevar'} • Orden #{bill.orderNumber || bill.id.slice(0, 6)}
          </DialogDescription>
        </DialogHeader>

        <CheckoutBreakdown
          subtotal={billSubtotal}
          taxTotal={billTax}
          tipAmount={tipAmount}
          tipPct={tipPct}
          billTotal={billTotal}
          onTipPctChange={setTipPct}
        />

        <div className="mb-5">
          <Label className="block mb-2">Medio de Pago:</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash' as const, label: 'Efectivo', icon: DollarSign, active: 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400' },
              { id: 'card_credit' as const, label: 'Tarjeta', icon: CreditCard, active: 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400' },
              { id: 'transfer' as const, label: 'Transferencia', icon: Send, active: 'bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400' },
            ].map(({ id, label, icon: Icon, active }) => (
              <Button
                key={id}
                variant="ghost"
                type="button"
                onClick={() => setPaymentMethod(id)}
                className={`p-3 h-auto rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  paymentMethod === id ? `${active} shadow-sm` : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {paymentMethod === 'cash' && (
          <Card className="p-4 bg-muted/40 rounded-2xl border-border mb-5 space-y-3">
            <Label className="block">Efectivo Entregado:</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted-foreground text-sm font-bold pointer-events-none">$</span>
              <Input
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder={billTotal.toString()}
                className="pl-8 font-mono text-sm h-10 rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2">
              {[billTotal, Math.ceil(billTotal / 10000) * 10000, Math.ceil(billTotal / 50000) * 50000].map((val, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCashTendered(val.toString())}
                  className="h-7 px-2.5 py-1 text-[11px] font-mono rounded-lg cursor-pointer"
                >
                  ${val.toLocaleString()}
                </Button>
              ))}
            </div>

            {tenderedNum > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Cambio / Vueltas:</span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">${changeDue.toLocaleString()}</span>
                </div>
              </>
            )}
          </Card>
        )}

        {paymentMethod !== 'cash' && (
          <div className="mb-5">
            <Label className="block mb-1.5">Referencia / Aprobación:</Label>
            <Input
              type="text"
              placeholder="Ej. 987452 o Nequi M1234"
              value={cardReference}
              onChange={(e) => setCardReference(e.target.value)}
              className="font-mono h-10 rounded-xl"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isProcessing || isCashInvalid}
            onClick={() => onConfirmPayment(paymentMethod, billTotal, tipAmount, cardReference)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center space-x-2"
          >
            <Receipt className="w-4 h-4" />
            <span>{isProcessing ? 'Emitiendo...' : 'Confirmar y Facturar'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
