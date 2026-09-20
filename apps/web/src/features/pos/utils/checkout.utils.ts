import { SplitMode, DiscountType } from '../types/pos.types';

export interface TotalsCalculationInput {
  baseSubtotal: number;
  baseTax: number;
  applyDiscount: boolean;
  discountType: DiscountType;
  discountValue: string;
  tipPct: number;
  checkoutMode?: SplitMode;
  equalSplitCount?: number;
}

export interface TotalsCalculationOutput {
  discountAmount: number;
  subAfterDiscount: number;
  tax: number;
  tipAmount: number;
  total: number;
}

export function calculateOrderTotals(input: TotalsCalculationInput): TotalsCalculationOutput {
  const {
    baseSubtotal,
    baseTax,
    applyDiscount,
    discountType,
    discountValue,
    tipPct,
    checkoutMode = 'single',
    equalSplitCount = 1,
  } = input;

  let discountAmount = 0;
  if (applyDiscount) {
    const val = parseFloat(discountValue) || 0;
    discountAmount = discountType === 'percent' ? (baseSubtotal * val) / 100 : val;
  }

  const subAfterDiscount = Math.max(0, baseSubtotal - discountAmount);
  const tax = baseTax;
  const tipAmount = (subAfterDiscount * tipPct) / 100;
  let total = subAfterDiscount + tax + tipAmount;

  if (checkoutMode === 'equal' && equalSplitCount > 0) {
    total = total / equalSplitCount;
  }

  return {
    discountAmount,
    subAfterDiscount,
    tax,
    tipAmount,
    total,
  };
}
