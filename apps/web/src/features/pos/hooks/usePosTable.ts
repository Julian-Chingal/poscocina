import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { posApi } from '../api/pos.api';
import { TableItem, CartItem } from '../types/pos.types';
import { toast } from '@/components/ui/sonner';

export const usePosTable = (
  venueId: string,
  initialTable?: TableItem | null,
  userId?: string
) => {
  const [currentTable, setCurrentTable] = useState<TableItem | null>(initialTable || null);
  const [allTables, setAllTables] = useState<TableItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isCashShiftOpen, setIsCashShiftOpen] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);

  useEffect(() => {
    if (initialTable) setCurrentTable(initialTable);
  }, [initialTable]);

  const checkCashShift = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await posApi.getCashShift(venueId);
      setIsCashShiftOpen(Boolean(data?.open));
    } catch {
      setIsCashShiftOpen(false);
    }
  }, [venueId]);

  const fetchTables = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await posApi.getTables(venueId);
      setAllTables(data || []);
      if (currentTable) {
        const updated = data.find((t) => t.id === currentTable.id);
        if (updated) setCurrentTable(updated);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  }, [venueId, currentTable]);

  const fetchActiveOrder = useCallback(async (orderId: string) => {
    try {
      const data = await posApi.getOrder(orderId);
      setActiveOrder(data || null);
    } catch {
      setActiveOrder(null);
    }
  }, []);

  useEffect(() => {
    checkCashShift();
    fetchTables();

    const socket = io();
    socket.on('cash_shift:opened', () => setIsCashShiftOpen(true));
    socket.on('cash_shift:closed', () => setIsCashShiftOpen(false));

    return () => {
      socket.disconnect();
    };
  }, [venueId, checkCashShift, fetchTables]);

  useEffect(() => {
    if (currentTable?.currentOrderId) {
      fetchActiveOrder(currentTable.currentOrderId);
    } else {
      setActiveOrder(null);
    }
  }, [currentTable?.currentOrderId, fetchActiveOrder]);

  const sendOrder = async (cart: CartItem[], customerId?: string) => {
    if (!cart.length) return false;
    setSubmitting(true);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes || undefined,
        modifiers: item.modifiers,
      }));

      if (activeOrder?.id) {
        await posApi.appendOrderItems(activeOrder.id, itemsPayload);
      } else {
        await posApi.createOrder({
          venueId,
          tableId: currentTable?.id,
          waiterId: userId,
          customerId,
          items: itemsPayload,
        });
      }

      setOrderSentSuccess(true);
      toast.success('¡Comanda enviada a cocina/barra exitosamente!');
      setTimeout(() => setOrderSentSuccess(false), 2500);
      fetchTables();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al marchar comanda');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const requestCheck = async () => {
    if (!activeOrder?.id) return;
    try {
      await posApi.requestCheck(activeOrder.id);
      toast.success('Pre-cuenta solicitada. Notificación enviada a caja.');
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Error al pedir la cuenta');
    }
  };

  return {
    currentTable,
    allTables,
    activeOrder,
    isCashShiftOpen,
    submitting,
    orderSentSuccess,
    setCurrentTable,
    sendOrder,
    requestCheck,
    refreshOrder: () => activeOrder?.id && fetchActiveOrder(activeOrder.id),
  };
};
