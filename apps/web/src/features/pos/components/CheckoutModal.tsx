import React from 'react';
import { Customer } from '../types/pos.types';
import { SplitBillDialog } from './SplitBillDialog';

interface Props {
  isOpen: boolean;
  order: any;
  customer?: Customer | null;
  venueId?: string;
  onClose: () => void;
  onSuccess?: (receipt: any) => void;
  // Legacy optional props for backwards compatibility
  processing?: boolean;
  paymentMethod?: any;
  cashTendered?: string;
  cardReference?: string;
  tipPct?: number;
  checkoutMode?: any;
  equalSplitCount?: number;
  applyDiscount?: boolean;
  discountType?: any;
  discountValue?: string;
  discountReason?: string;
  onPaymentMethodChange?: (m: any) => void;
  onCashTenderedChange?: (c: string) => void;
  onCardReferenceChange?: (r: string) => void;
  onTipPctChange?: (t: number) => void;
  onCheckoutModeChange?: (m: any) => void;
  onEqualSplitCountChange?: (c: number) => void;
  onApplyDiscountChange?: (a: boolean) => void;
  onDiscountTypeChange?: (t: any) => void;
  onDiscountValueChange?: (v: string) => void;
  onDiscountReasonChange?: (r: string) => void;
  onProcessPayment?: (total: number, tip: number) => void;
}

export const CheckoutModal: React.FC<Props> = ({
  isOpen,
  order,
  customer,
  venueId,
  onClose,
  onSuccess,
}) => {
  const targetVenueId = venueId || order?.venueId || '';

  return (
    <SplitBillDialog
      isOpen={isOpen}
      order={order}
      customer={customer}
      venueId={targetVenueId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};

export default CheckoutModal;
