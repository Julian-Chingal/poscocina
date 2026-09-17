import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { cashShiftsApi } from '../api/cash-shifts.api';
import { PendingBill, ReceiptData, PaymentMethod } from '../types/cash-shifts.types';
import { toast } from '@/components/ui/sonner';

export const usePendingBills = (venueId: string, onPaymentSuccess?: () => void) => {
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<PendingBill | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<ReceiptData | null>(null);

  const fetchPendingBills = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await cashShiftsApi.getPendingBills(venueId);
      setPendingBills(data || []);
    } catch (err) {
      console.error('Error fetching pending bills:', err);
    }
  }, [venueId]);

  useEffect(() => {
    fetchPendingBills();
    const socket = io();
    const handleRefresh = () => fetchPendingBills();

    socket.on('order:created', handleRefresh);
    socket.on('order:items_appended', handleRefresh);
    socket.on('order:status_updated', handleRefresh);
    socket.on('table:status_changed', handleRefresh);

    return () => {
      socket.off('order:created', handleRefresh);
      socket.off('order:items_appended', handleRefresh);
      socket.off('order:status_updated', handleRefresh);
      socket.off('table:status_changed', handleRefresh);
      socket.disconnect();
    };
  }, [venueId, fetchPendingBills]);

  const confirmPayment = async (
    method: PaymentMethod,
    finalTotal: number,
    tipAmount: number,
    reference?: string
  ) => {
    if (!selectedBill) return;
    setProcessingPayment(true);
    try {
      const paymentPayload = {
        orderId: selectedBill.id,
        payments: [
          {
            method,
            amount: finalTotal,
            reference: reference || undefined,
            tipAmount,
          },
        ],
      };

      const data = await cashShiftsApi.processPayment(paymentPayload);
      toast.success('Pago procesado y factura emitida');
      setReceiptSuccess(data.receipt);
      setSelectedBill(null);
      fetchPendingBills();
      onPaymentSuccess?.();

      cashShiftsApi.printReceipt(data.receipt.id).catch(() => {});
      if (method === 'cash') {
        cashShiftsApi.openDrawer(venueId).catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  return {
    pendingBills,
    selectedBill,
    processingPayment,
    receiptSuccess,
    setSelectedBill,
    clearReceiptSuccess: () => setReceiptSuccess(null),
    confirmPayment,
    refreshPendingBills: fetchPendingBills,
  };
};
