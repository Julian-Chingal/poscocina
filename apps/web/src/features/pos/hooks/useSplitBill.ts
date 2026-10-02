import { useState, useMemo, useCallback, useEffect } from 'react';
import type { IssueReceiptInput, SplitEqualPaymentInput, SplitItemsPaymentInput, PaymentItem } from '@poscocina/shared';
import { posApi } from '../api/pos.api';
import { toast } from '@/components/ui/sonner';
import {
  SplitMode,
  PaymentMethodType,
  PaymentLineState,
  SplitPartState,
} from '../types/split-bill.types';

export interface UseSplitBillProps {
  order: any;
  venueId: string;
  customerId?: string | null;
  taxRate?: number;
  initialSplitMode?: SplitMode;
  onSuccess?: (receipt: any) => void;
}

const createDefaultPaymentLine = (amount: number, method: PaymentMethodType = 'cash'): PaymentLineState => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `line_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  method,
  amount: Math.max(0, Math.round(amount * 100) / 100),
  cashTendered: '',
  reference: '',
  tipAmount: 0,
});

export const useSplitBill = ({
  order,
  venueId,
  customerId,
  taxRate = 0.08,
  initialSplitMode = 'single',
  onSuccess,
}: UseSplitBillProps) => {
  const [splitMode, setSplitModeState] = useState<SplitMode>(initialSplitMode);
  const [equalCount, setEqualCountState] = useState<number>(2);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [applyDiscount, setApplyDiscount] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [discountReason, setDiscountReason] = useState<string>('Cortesía / Descuento autorizado');
  const [tipPct, setTipPct] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Financial calculations
  const orderCalculations = useMemo(() => {
    if (!order) {
      return {
        baseSubtotal: 0,
        discountAmount: 0,
        subAfterDiscount: 0,
        baseTax: 0,
        pendingBalance: 0,
        tipAmount: 0,
        finalTotal: 0,
        itemsGross: 0,
      };
    }

    const sub = parseFloat(order.subtotal || '0');
    const tax = parseFloat(order.taxTotal || '0');
    const totalPaid = parseFloat(order.totalPaid || '0');
    const hasPriorPayments = totalPaid > 0.009;

    let disc = 0;
    if (applyDiscount) {
      const val = parseFloat(discountValue) || 0;
      disc = discountType === 'percent' ? (sub * val) / 100 : val;
      disc = Math.min(sub, Math.max(0, disc));
    }

    const subAfterDiscount = Math.max(0, sub - disc);
    const orderTotalNum = parseFloat(order.total || '0');
    const pendingBalance =
      order.pendingBalance !== undefined
        ? parseFloat(order.pendingBalance)
        : Math.max(0, hasPriorPayments ? orderTotalNum - totalPaid : subAfterDiscount + tax);

    // If items mode, target is based on selected items
    let itemsGross = 0;
    if (splitMode === 'items' && Array.isArray(order.items)) {
      const selected = order.items.filter((i: any) => selectedItemIds.includes(i.id));
      itemsGross = selected.reduce((sum: number, i: any) => sum + parseFloat(i.unitPrice || '0') * (i.quantity || 1), 0);
    }

    const baseForPay =
      splitMode === 'items'
        ? itemsGross * (1 + taxRate)
        : hasPriorPayments
        ? pendingBalance
        : subAfterDiscount + tax;

    const tip = Math.round(((subAfterDiscount * tipPct) / 100) * 100) / 100;
    const finalTotal = Math.round((baseForPay + (splitMode === 'items' ? 0 : tip)) * 100) / 100;

    return {
      baseSubtotal: sub,
      discountAmount: disc,
      subAfterDiscount,
      baseTax: tax,
      pendingBalance,
      tipAmount: tip,
      finalTotal: Math.max(0, finalTotal),
      itemsGross,
    };
  }, [order, applyDiscount, discountValue, discountType, tipPct, splitMode, selectedItemIds, taxRate]);

  // Initialize Parts based on splitMode
  const generateInitialParts = useCallback(
    (mode: SplitMode, count: number, total: number): SplitPartState[] => {
      if (total <= 0) {
        return [
          {
            id: 'part-1',
            name: 'Cuenta Completa',
            targetAmount: 0,
            payments: [createDefaultPaymentLine(0)],
          },
        ];
      }

      if (mode === 'single') {
        return [
          {
            id: 'part-1',
            name: 'Cuenta Completa',
            targetAmount: total,
            payments: [createDefaultPaymentLine(total)],
          },
        ];
      }

      if (mode === 'equal') {
        const partsCount = Math.max(2, Math.min(10, count));
        const baseShare = Math.floor((total / partsCount) * 100) / 100;
        const remainder = Math.round((total - baseShare * partsCount) * 100) / 100;

        return Array.from({ length: partsCount }, (_, idx) => {
          const isLast = idx === partsCount - 1;
          const share = isLast ? Math.round((baseShare + remainder) * 100) / 100 : baseShare;
          return {
            id: `part-${idx + 1}`,
            name: `Persona ${idx + 1}`,
            targetAmount: share,
            payments: [createDefaultPaymentLine(share)],
          };
        });
      }

      if (mode === 'custom') {
        const partsCount = Math.max(2, count);
        const baseShare = Math.floor((total / partsCount) * 100) / 100;
        const remainder = Math.round((total - baseShare * partsCount) * 100) / 100;

        return Array.from({ length: partsCount }, (_, idx) => {
          const isLast = idx === partsCount - 1;
          const share = isLast ? Math.round((baseShare + remainder) * 100) / 100 : baseShare;
          return {
            id: `part-custom-${idx + 1}`,
            name: `Persona ${idx + 1}`,
            targetAmount: share,
            payments: [createDefaultPaymentLine(share)],
          };
        });
      }

      if (mode === 'items') {
        return [
          {
            id: 'part-items-1',
            name: 'Cobro de Ítems Seleccionados',
            targetAmount: total,
            payments: [createDefaultPaymentLine(total)],
          },
        ];
      }

      return [];
    },
    []
  );

  const [parts, setParts] = useState<SplitPartState[]>(() =>
    generateInitialParts('single', 2, orderCalculations.finalTotal)
  );

  // Sync parts whenever mode, equalCount, or finalTotal changes
  useEffect(() => {
    setParts(generateInitialParts(splitMode, equalCount, orderCalculations.finalTotal));
    setApiError(null);
  }, [splitMode, equalCount, orderCalculations.finalTotal, generateInitialParts]);

  // Aggregate payment totals in real-time
  const summary = useMemo(() => {
    let totalCovered = 0;
    let allPaymentsCount = 0;
    let hasInvalidCash = false;
    let hasZeroOrNegativeAmount = false;

    for (const part of parts) {
      for (const line of part.payments) {
        allPaymentsCount += 1;
        totalCovered += line.amount;

        if (line.amount <= 0) {
          hasZeroOrNegativeAmount = true;
        }

        if (line.method === 'cash') {
          const tendered = parseFloat(line.cashTendered);
          if (!isNaN(tendered) && tendered > 0 && tendered < line.amount) {
            hasInvalidCash = true;
          }
        }
      }
    }

    totalCovered = Math.round(totalCovered * 100) / 100;
    const remainingBalance = Math.round((orderCalculations.finalTotal - totalCovered) * 100) / 100;
    const isBalanced = Math.abs(remainingBalance) < 0.01 && orderCalculations.finalTotal > 0;
    const isReadyToSubmit =
      isBalanced &&
      !hasZeroOrNegativeAmount &&
      !hasInvalidCash &&
      allPaymentsCount > 0 &&
      (splitMode !== 'items' || selectedItemIds.length > 0);

    return {
      orderTotal: orderCalculations.finalTotal,
      subtotal: orderCalculations.baseSubtotal,
      taxTotal: orderCalculations.baseTax,
      discountTotal: orderCalculations.discountAmount,
      tipTotal: orderCalculations.tipAmount,
      totalCovered,
      remainingBalance,
      isBalanced,
      isReadyToSubmit,
      hasInvalidCash,
      hasZeroOrNegativeAmount,
    };
  }, [parts, orderCalculations, splitMode, selectedItemIds]);

  // Actions for modifying parts and payment lines
  const setSplitMode = useCallback(
    (newMode: SplitMode) => {
      setSplitModeState(newMode);
      setApiError(null);
    },
    []
  );

  const setEqualCount = useCallback(
    (count: number) => {
      const sanitized = Math.max(2, Math.min(10, count));
      setEqualCountState(sanitized);
      setApiError(null);
    },
    []
  );

  const addCustomPart = useCallback(() => {
    setParts((prev) => {
      const newIndex = prev.length + 1;
      const currentCovered = prev.reduce((sum, p) => sum + p.targetAmount, 0);
      const remainingTarget = Math.max(0, Math.round((orderCalculations.finalTotal - currentCovered) * 100) / 100);

      const newPart: SplitPartState = {
        id: `part-custom-${Date.now()}`,
        name: `Persona ${newIndex}`,
        targetAmount: remainingTarget,
        payments: [createDefaultPaymentLine(remainingTarget)],
      };
      return [...prev, newPart];
    });
  }, [orderCalculations.finalTotal]);

  const removeCustomPart = useCallback((partId: string) => {
    setParts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== partId);
    });
  }, []);

  const updatePartName = useCallback((partId: string, name: string) => {
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, name } : p))
    );
  }, []);

  const updatePartTargetAmount = useCallback((partId: string, targetAmount: number) => {
    const sanitized = Math.max(0, Math.round(targetAmount * 100) / 100);
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        // If single payment line exists, sync its amount with the target
        const updatedPayments =
          p.payments.length === 1
            ? [{ ...p.payments[0], amount: sanitized }]
            : p.payments;
        return { ...p, targetAmount: sanitized, payments: updatedPayments };
      })
    );
  }, []);

  const addPaymentLine = useCallback((partId: string, method: PaymentMethodType = 'card_credit') => {
    setParts((prev) =>
      prev.map((part) => {
        if (part.id !== partId) return part;
        const partCovered = part.payments.reduce((sum, line) => sum + line.amount, 0);
        const unassignedInPart = Math.max(0, Math.round((part.targetAmount - partCovered) * 100) / 100);
        const newLine = createDefaultPaymentLine(unassignedInPart, method);
        return {
          ...part,
          payments: [...part.payments, newLine],
        };
      })
    );
  }, []);

  const updatePaymentLine = useCallback(
    (partId: string, lineId: string, updates: Partial<PaymentLineState>) => {
      setParts((prev) =>
        prev.map((part) => {
          if (part.id !== partId) return part;
          const updatedPayments = part.payments.map((line) => {
            if (line.id !== lineId) return line;
            return { ...line, ...updates };
          });
          return { ...part, payments: updatedPayments };
        })
      );
    },
    []
  );

  const removePaymentLine = useCallback((partId: string, lineId: string) => {
    setParts((prev) =>
      prev.map((part) => {
        if (part.id !== partId) return part;
        if (part.payments.length <= 1) return part; // Keep at least one line per part
        return {
          ...part,
          payments: part.payments.filter((line) => line.id !== lineId),
        };
      })
    );
  }, []);

  const setExactCashTendered = useCallback((partId: string, lineId: string) => {
    setParts((prev) =>
      prev.map((part) => {
        if (part.id !== partId) return part;
        return {
          ...part,
          payments: part.payments.map((line) => {
            if (line.id !== lineId) return line;
            return { ...line, cashTendered: line.amount.toString() };
          }),
        };
      })
    );
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    if (order?.items) {
      setSelectedItemIds(order.items.map((i: any) => i.id));
    }
  }, [order]);

  const clearItemSelection = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  // Helper to calculate change for a cash payment line
  const calculateChange = useCallback((line: PaymentLineState): { changeDue: number; isShort: boolean } => {
    if (line.method !== 'cash') return { changeDue: 0, isShort: false };
    const tendered = parseFloat(line.cashTendered);
    if (isNaN(tendered) || tendered === 0) return { changeDue: 0, isShort: false };
    const changeDue = Math.max(0, Math.round((tendered - line.amount) * 100) / 100);
    const isShort = tendered < line.amount;
    return { changeDue, isShort };
  }, []);

  // Construct Fastify payloads strictly obeying the backend contracts
  const buildFastifyPayload = useCallback((): {
    endpoint: 'receipts' | 'split-equal' | 'split-items';
    payload: IssueReceiptInput | SplitEqualPaymentInput | SplitItemsPaymentInput;
  } => {
    if (!order?.id) {
      throw new Error('No se encontró el ID de la orden.');
    }

    // Flatten all payment lines across all parts
    const allPayments: PaymentItem[] = [];
    for (const part of parts) {
      for (const line of part.payments) {
        if (line.amount > 0) {
          allPayments.push({
            method: line.method,
            amount: Math.round(line.amount * 100) / 100,
            reference: line.reference ? line.reference.trim() : undefined,
            tipAmount: line.tipAmount > 0 ? Math.round(line.tipAmount * 100) / 100 : 0,
          });
        }
      }
    }

    if (allPayments.length === 0) {
      throw new Error('Debe registrar al menos un método de pago con monto mayor a cero.');
    }

    const discValueNum = parseFloat(discountValue) || 0;
    const targetCustomerId = customerId || order.customerId || null;

    if (splitMode === 'items') {
      if (selectedItemIds.length === 0) {
        throw new Error('Debe seleccionar al menos un ítem para cobrar por partes.');
      }
      const payload: SplitItemsPaymentInput = {
        orderId: order.id,
        customerId: targetCustomerId,
        itemIds: selectedItemIds,
        payments: allPayments,
        discountType: applyDiscount ? discountType : undefined,
        discountValue: applyDiscount && discValueNum > 0 ? discValueNum : undefined,
        discountReason: applyDiscount && discountReason ? discountReason.trim() : undefined,
      };
      return { endpoint: 'split-items', payload };
    }

    // For single, equal, or custom full-payment splits, send payments to /receipts
    const payload: IssueReceiptInput = {
      orderId: order.id,
      customerId: targetCustomerId,
      payments: allPayments,
      isSplit: splitMode !== 'single',
      discountType: applyDiscount ? discountType : undefined,
      discountValue: applyDiscount && discValueNum > 0 ? discValueNum : undefined,
      discountReason: applyDiscount && discountReason ? discountReason.trim() : undefined,
    };
    return { endpoint: 'receipts', payload };
  }, [order, parts, customerId, splitMode, selectedItemIds, applyDiscount, discountType, discountValue, discountReason]);

  // Execute checkout against Fastify
  const processSplitPayment = useCallback(async () => {
    if (!summary.isReadyToSubmit) {
      setApiError('El saldo restante debe ser exactamente 0 para poder emitir la factura.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const { endpoint, payload } = buildFastifyPayload();
      let response: any;

      if (endpoint === 'split-items') {
        response = await posApi.splitItems(payload as SplitItemsPaymentInput);
      } else {
        response = await posApi.processPayment(payload as IssueReceiptInput);
      }

      toast.success('Pago procesado y comprobante generado con éxito.');

      // Check if cash drawer needs opening
      const hasCash = parts.some((p) => p.payments.some((line) => line.method === 'cash'));
      if (hasCash && venueId) {
        posApi.openDrawer(venueId).catch(() => {});
      }

      // Print receipt automatically
      if (response?.receipt?.id) {
        posApi.printReceipt(response.receipt.id).catch(() => {});
      }

      onSuccess?.(response?.receipt || response);
      return response;
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.data?.message ||
        'Error del servidor al procesar el pago. Por favor verifique el estado de la caja.';
      setApiError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [summary.isReadyToSubmit, buildFastifyPayload, parts, venueId, onSuccess]);

  return {
    // State
    splitMode,
    equalCount,
    parts,
    selectedItemIds,
    applyDiscount,
    discountType,
    discountValue,
    discountReason,
    tipPct,
    isSubmitting,
    apiError,
    summary,
    orderCalculations,

    // Actions
    setSplitMode,
    setEqualCount,
    addCustomPart,
    removeCustomPart,
    updatePartName,
    updatePartTargetAmount,
    addPaymentLine,
    updatePaymentLine,
    removePaymentLine,
    setExactCashTendered,
    toggleItemSelection,
    selectAllItems,
    clearItemSelection,
    setApplyDiscount,
    setDiscountType,
    setDiscountValue,
    setDiscountReason,
    setTipPct,
    setApiError,
    calculateChange,
    processSplitPayment,
  };
};

export default useSplitBill;
