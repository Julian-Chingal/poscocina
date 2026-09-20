import { useReducer, useCallback } from 'react';
import { posApi } from '../api/pos.api';
import { SplitMode, PaymentMethod, DiscountType } from '../types/pos.types';
import { calculateOrderTotals } from '../utils/checkout.utils';
import { toast } from '@/components/ui/sonner';

export interface CheckoutState {
  showCheckoutModal: boolean;
  checkoutMode: SplitMode;
  paymentMethod: PaymentMethod;
  cashTendered: string;
  cardReference: string;
  tipPct: number;
  processing: boolean;
  receiptSuccess: any;
  applyDiscount: boolean;
  discountType: DiscountType;
  discountValue: string;
  discountReason: string;
  equalSplitCount: number;
  selectedItemIds: string[];
}

type CheckoutAction =
  | { type: 'SET_SHOW_MODAL'; payload: boolean }
  | { type: 'SET_CHECKOUT_MODE'; payload: SplitMode }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_CASH_TENDERED'; payload: string }
  | { type: 'SET_CARD_REFERENCE'; payload: string }
  | { type: 'SET_TIP_PCT'; payload: number }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_RECEIPT_SUCCESS'; payload: any }
  | { type: 'SET_APPLY_DISCOUNT'; payload: boolean }
  | { type: 'SET_DISCOUNT_TYPE'; payload: DiscountType }
  | { type: 'SET_DISCOUNT_VALUE'; payload: string }
  | { type: 'SET_DISCOUNT_REASON'; payload: string }
  | { type: 'SET_EQUAL_SPLIT_COUNT'; payload: number }
  | { type: 'SET_SELECTED_ITEM_IDS'; payload: string[] };

const initialState: CheckoutState = {
  showCheckoutModal: false,
  checkoutMode: 'single',
  paymentMethod: 'cash',
  cashTendered: '',
  cardReference: '',
  tipPct: 0,
  processing: false,
  receiptSuccess: null,
  applyDiscount: false,
  discountType: 'percent',
  discountValue: '10',
  discountReason: 'Cortesía de la casa',
  equalSplitCount: 2,
  selectedItemIds: [],
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_SHOW_MODAL':
      return { ...state, showCheckoutModal: action.payload };
    case 'SET_CHECKOUT_MODE':
      return { ...state, checkoutMode: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_CASH_TENDERED':
      return { ...state, cashTendered: action.payload };
    case 'SET_CARD_REFERENCE':
      return { ...state, cardReference: action.payload };
    case 'SET_TIP_PCT':
      return { ...state, tipPct: action.payload };
    case 'SET_PROCESSING':
      return { ...state, processing: action.payload };
    case 'SET_RECEIPT_SUCCESS':
      return { ...state, receiptSuccess: action.payload };
    case 'SET_APPLY_DISCOUNT':
      return { ...state, applyDiscount: action.payload };
    case 'SET_DISCOUNT_TYPE':
      return { ...state, discountType: action.payload };
    case 'SET_DISCOUNT_VALUE':
      return { ...state, discountValue: action.payload };
    case 'SET_DISCOUNT_REASON':
      return { ...state, discountReason: action.payload };
    case 'SET_EQUAL_SPLIT_COUNT':
      return { ...state, equalSplitCount: action.payload };
    case 'SET_SELECTED_ITEM_IDS':
      return { ...state, selectedItemIds: action.payload };
    default:
      return state;
  }
}

export const usePosCheckout = (venueId: string, onCheckoutSuccess?: () => void) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const calculateTotals = useCallback(
    (baseSubtotal: number, baseTax: number) => {
      return calculateOrderTotals({
        baseSubtotal,
        baseTax,
        applyDiscount: state.applyDiscount,
        discountType: state.discountType,
        discountValue: state.discountValue,
        tipPct: state.tipPct,
        checkoutMode: state.checkoutMode,
        equalSplitCount: state.equalSplitCount,
      });
    },
    [state.applyDiscount, state.discountType, state.discountValue, state.tipPct, state.checkoutMode, state.equalSplitCount]
  );

  const processPayment = async (orderId: string, total: number, tipAmount: number) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      const payload = {
        orderId,
        payments: [
          {
            method: state.paymentMethod,
            amount: total,
            reference: state.cardReference || undefined,
            tipAmount,
          },
        ],
      };

      const data = await posApi.processPayment(payload);
      toast.success('Pago completado y factura emitida');
      dispatch({ type: 'SET_RECEIPT_SUCCESS', payload: data.receipt });
      dispatch({ type: 'SET_SHOW_MODAL', payload: false });
      onCheckoutSuccess?.();

      posApi.printReceipt(data.receipt.id).catch(() => {});
      if (state.paymentMethod === 'cash') {
        posApi.openDrawer(venueId).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return {
    ...state,
    setShowCheckoutModal: (v: boolean) => dispatch({ type: 'SET_SHOW_MODAL', payload: v }),
    setCheckoutMode: (m: SplitMode) => dispatch({ type: 'SET_CHECKOUT_MODE', payload: m }),
    setPaymentMethod: (p: PaymentMethod) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: p }),
    setCashTendered: (c: string) => dispatch({ type: 'SET_CASH_TENDERED', payload: c }),
    setCardReference: (r: string) => dispatch({ type: 'SET_CARD_REFERENCE', payload: r }),
    setTipPct: (t: number) => dispatch({ type: 'SET_TIP_PCT', payload: t }),
    setApplyDiscount: (a: boolean) => dispatch({ type: 'SET_APPLY_DISCOUNT', payload: a }),
    setDiscountType: (d: DiscountType) => dispatch({ type: 'SET_DISCOUNT_TYPE', payload: d }),
    setDiscountValue: (v: string) => dispatch({ type: 'SET_DISCOUNT_VALUE', payload: v }),
    setDiscountReason: (r: string) => dispatch({ type: 'SET_DISCOUNT_REASON', payload: r }),
    setEqualSplitCount: (c: number) => dispatch({ type: 'SET_EQUAL_SPLIT_COUNT', payload: c }),
    setSelectedItemIds: (ids: string[]) => dispatch({ type: 'SET_SELECTED_ITEM_IDS', payload: ids }),
    clearReceiptSuccess: () => dispatch({ type: 'SET_RECEIPT_SUCCESS', payload: null }),
    calculateTotals,
    processPayment,
  };
};

export default usePosCheckout;
