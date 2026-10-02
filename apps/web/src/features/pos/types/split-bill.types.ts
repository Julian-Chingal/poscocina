import type { PaymentItem } from '@poscocina/shared';

export type PaymentMethodType = PaymentItem['method'];

export interface PaymentMethodOption {
  id: PaymentMethodType;
  label: string;
  isElectronic: boolean;
}

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
  { id: 'cash', label: 'Efectivo', isElectronic: false },
  { id: 'card_credit', label: 'Tarjeta de Crédito', isElectronic: true },
  { id: 'card_debit', label: 'Tarjeta de Débito', isElectronic: true },
  { id: 'transfer', label: 'Transferencia', isElectronic: true },
  { id: 'voucher', label: 'Bono / Voucher', isElectronic: true },
  { id: 'other', label: 'Otro', isElectronic: false },
] as const;

export interface PaymentLineState {
  id: string;
  method: PaymentMethodType;
  amount: number;
  cashTendered: string;
  reference: string;
  tipAmount: number;
}

export interface SplitPartState {
  id: string;
  name: string;
  targetAmount: number;
  payments: PaymentLineState[];
}

import type { SplitMode } from './pos.types';
export type { SplitMode };

export interface OrderItemPreview {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SplitBillState {
  splitMode: SplitMode;
  parts: SplitPartState[];
  equalCount: number;
  selectedItemIds: string[];
  activePartId: string;
  applyDiscount: boolean;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  discountReason: string;
  tipPct: number;
  isSubmitting: boolean;
  apiError: string | null;
}
