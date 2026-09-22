import React, { useMemo } from 'react';
import { Sparkles, Receipt } from 'lucide-react';
import { SplitMode, PaymentMethod, DiscountType, Customer } from '../types/pos.types';
import { SplitBillSection } from './SplitBillSection';
import { CheckoutSummary } from './CheckoutSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  isOpen: boolean;
  order: any;
  customer: Customer | null;
  processing: boolean;
  paymentMethod: PaymentMethod;
  cashTendered: string;
  cardReference: string;
  tipPct: number;
  checkoutMode: SplitMode;
  equalSplitCount: number;
  applyDiscount: boolean;
  discountType: DiscountType;
  discountValue: string;
  discountReason: string;
  onClose: () => void;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  onCashTenderedChange: (c: string) => void;
  onCardReferenceChange: (r: string) => void;
  onTipPctChange: (t: number) => void;
  onCheckoutModeChange: (m: SplitMode) => void;
  onEqualSplitCountChange: (c: number) => void;
  onApplyDiscountChange: (a: boolean) => void;
  onDiscountTypeChange: (t: DiscountType) => void;
  onDiscountValueChange: (v: string) => void;
  onDiscountReasonChange: (r: string) => void;
  onProcessPayment: (total: number, tip: number) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  order,
  customer,
  processing,
  paymentMethod,
  cashTendered,
  cardReference,
  tipPct,
  checkoutMode,
  equalSplitCount,
  applyDiscount,
  discountType,
  discountValue,
  discountReason,
  onClose,
  onPaymentMethodChange,
  onCashTenderedChange,
  onCardReferenceChange,
  onTipPctChange,
  onCheckoutModeChange,
  onEqualSplitCountChange,
  onApplyDiscountChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onDiscountReasonChange,
  onProcessPayment,
}) => {
  const { baseSubtotal, discountAmount, baseTax, tipAmount, finalTotal } = useMemo(() => {
    if (!order) {
      return { baseSubtotal: 0, discountAmount: 0, baseTax: 0, tipAmount: 0, finalTotal: 0 };
    }
    const sub = parseFloat(order.subtotal || '0');
    const tax = parseFloat(order.taxTotal || '0');

    let disc = 0;
    if (applyDiscount) {
      const val = parseFloat(discountValue) || 0;
      disc = discountType === 'percent' ? (sub * val) / 100 : val;
    }

    const subAfterDiscount = Math.max(0, sub - disc);
    const tip = (subAfterDiscount * tipPct) / 100;
    let total = subAfterDiscount + tax + tip;

    if (checkoutMode === 'equal' && equalSplitCount > 0) {
      total = total / equalSplitCount;
    }

    return {
      baseSubtotal: sub,
      discountAmount: disc,
      baseTax: tax,
      tipAmount: tip,
      finalTotal: total,
    };
  }, [order, applyDiscount, discountValue, discountType, tipPct, checkoutMode, equalSplitCount]);

  if (!isOpen || !order) return null;

  const tenderedNum = parseFloat(cashTendered) || 0;
  const isCashInvalid = paymentMethod === 'cash' && tenderedNum > 0 && tenderedNum < finalTotal;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="lg" onClose={onClose} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Facturación POS</span>
          </div>
          <DialogTitle className="text-xl font-black">Cobro de Orden</DialogTitle>
          <DialogDescription>
            Orden #{order.orderNumber || order.id?.slice(0, 6)}{' '}
            {customer && `• Cliente: ${customer.name}`}
          </DialogDescription>
        </DialogHeader>

        <CheckoutSummary
          baseSubtotal={baseSubtotal}
          discountAmount={discountAmount}
          baseTax={baseTax}
          tipPct={tipPct}
          finalTotal={finalTotal}
          checkoutMode={checkoutMode}
          equalSplitCount={equalSplitCount}
          onTipPctChange={onTipPctChange}
        />

        <SplitBillSection
          checkoutMode={checkoutMode}
          equalSplitCount={equalSplitCount}
          applyDiscount={applyDiscount}
          discountType={discountType}
          discountValue={discountValue}
          discountReason={discountReason}
          onModeChange={onCheckoutModeChange}
          onSplitCountChange={onEqualSplitCountChange}
          onApplyDiscountChange={onApplyDiscountChange}
          onDiscountTypeChange={onDiscountTypeChange}
          onDiscountValueChange={onDiscountValueChange}
          onDiscountReasonChange={onDiscountReasonChange}
        />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          cashTendered={cashTendered}
          cardReference={cardReference}
          finalTotal={finalTotal}
          onPaymentMethodChange={onPaymentMethodChange}
          onCashTenderedChange={onCashTenderedChange}
          onCardReferenceChange={onCardReferenceChange}
        />

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={processing || isCashInvalid}
            onClick={() => onProcessPayment(finalTotal, tipAmount)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center space-x-2"
          >
            <Receipt className="w-4 h-4" />
            <span>{processing ? 'Emitiendo...' : 'Facturar'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
