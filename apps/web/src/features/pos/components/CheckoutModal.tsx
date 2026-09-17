import React from 'react';
import { X, Sparkles, Receipt } from 'lucide-react';
import { SplitMode, PaymentMethod, DiscountType, Customer } from '../types/pos.types';
import { SplitBillSection } from './SplitBillSection';
import { CheckoutSummary } from './CheckoutSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';

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
  if (!isOpen || !order) return null;

  const baseSubtotal = parseFloat(order.subtotal || '0');
  const baseTax = parseFloat(order.taxTotal || '0');

  let discountAmount = 0;
  if (applyDiscount) {
    const val = parseFloat(discountValue) || 0;
    discountAmount = discountType === 'percent' ? (baseSubtotal * val) / 100 : val;
  }

  const subtotalAfterDiscount = Math.max(0, baseSubtotal - discountAmount);
  const tipAmount = (subtotalAfterDiscount * tipPct) / 100;
  let finalTotal = subtotalAfterDiscount + baseTax + tipAmount;

  if (checkoutMode === 'equal') {
    finalTotal = finalTotal / equalSplitCount;
  }

  const tenderedNum = parseFloat(cashTendered) || 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Facturación POS</span>
        </div>
        <h3 className="text-xl font-black text-white">Cobro de Orden</h3>
        <p className="text-xs text-slate-400 mb-4">
          Orden #{order.orderNumber || order.id?.slice(0, 6)} {customer && `• Cliente: ${customer.name}`}
        </p>

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

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            type="button"
            disabled={processing || (paymentMethod === 'cash' && tenderedNum > 0 && tenderedNum < finalTotal)}
            onClick={() => onProcessPayment(finalTotal, tipAmount)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Receipt className="w-4 h-4" />
            <span>{processing ? 'Emitiendo...' : 'Facturar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
