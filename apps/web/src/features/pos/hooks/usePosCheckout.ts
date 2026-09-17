import { useState } from 'react';
import { posApi } from '../api/pos.api';
import { SplitMode, PaymentMethod, DiscountType } from '../types/pos.types';
import { toast } from '@/components/ui/sonner';

export const usePosCheckout = (venueId: string, onCheckoutSuccess?: () => void) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<SplitMode>('single');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [cardReference, setCardReference] = useState('');
  const [tipPct, setTipPct] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any>(null);

  // Discounts
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('10');
  const [discountReason, setDiscountReason] = useState('Cortesía de la casa');

  // Split calculations
  const [equalSplitCount, setEqualSplitCount] = useState(2);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const calculateTotals = (baseSubtotal: number, baseTax: number) => {
    let discountAmount = 0;
    if (applyDiscount) {
      const val = parseFloat(discountValue) || 0;
      discountAmount = discountType === 'percent' ? (baseSubtotal * val) / 100 : val;
    }

    const subAfterDiscount = Math.max(0, baseSubtotal - discountAmount);
    const tax = baseTax;
    const tipAmount = (subAfterDiscount * tipPct) / 100;
    const total = subAfterDiscount + tax + tipAmount;

    return { discountAmount, subAfterDiscount, tax, tipAmount, total };
  };

  const processPayment = async (orderId: string, total: number, tipAmount: number) => {
    setProcessing(true);
    try {
      const payload = {
        orderId,
        payments: [
          {
            method: paymentMethod,
            amount: total,
            reference: cardReference || undefined,
            tipAmount,
          },
        ],
      };

      const data = await posApi.processPayment(payload);
      toast.success('Pago completado y factura emitida');
      setReceiptSuccess(data.receipt);
      setShowCheckoutModal(false);
      onCheckoutSuccess?.();

      posApi.printReceipt(data.receipt.id).catch(() => {});
      if (paymentMethod === 'cash') {
        posApi.openDrawer(venueId).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  return {
    showCheckoutModal,
    checkoutMode,
    paymentMethod,
    cashTendered,
    cardReference,
    tipPct,
    processing,
    receiptSuccess,
    applyDiscount,
    discountType,
    discountValue,
    discountReason,
    equalSplitCount,
    selectedItemIds,
    setShowCheckoutModal,
    setCheckoutMode,
    setPaymentMethod,
    setCashTendered,
    setCardReference,
    setTipPct,
    setApplyDiscount,
    setDiscountType,
    setDiscountValue,
    setDiscountReason,
    setEqualSplitCount,
    setSelectedItemIds,
    clearReceiptSuccess: () => setReceiptSuccess(null),
    calculateTotals,
    processPayment,
  };
};
