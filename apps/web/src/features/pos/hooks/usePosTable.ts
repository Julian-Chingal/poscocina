import { useState, useEffect, useCallback } from 'react';
import { posApi } from '../api/pos.api';
import { TableItem, CartItem, PosOrder } from '../types/pos.types';
import { useShiftStore } from '@/stores/shift.store';
import { toast } from '@/components/ui/sonner';

export const usePosTable = (
  venueId: string,
  initialTable?: TableItem | null,
  userId?: string
) => {
  const [currentTable, setCurrentTable] = useState<TableItem | null>(initialTable || null);
  const [allTables, setAllTables] = useState<TableItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<PosOrder | null>(null);
  const isCashShiftOpen = useShiftStore((s) => s.isOpen);
  const [submitting, setSubmitting] = useState(false);
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);

  useEffect(() => {
    if (initialTable) setCurrentTable(initialTable);
  }, [initialTable]);

  const checkCashShift = useCallback(async () => {
    if (!venueId) return;
    await useShiftStore.getState().fetchCurrentShift(venueId);
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
    if (!venueId) return;
    const cleanupSocket = useShiftStore.getState().initSocket(venueId);
    return () => {
      cleanupSocket();
    };
  }, [venueId]);

  useEffect(() => {
    checkCashShift();
    fetchTables();
  }, [checkCashShift, fetchTables]);

  useEffect(() => {
    if (currentTable?.currentOrderId) {
      fetchActiveOrder(currentTable.currentOrderId);
    } else {
      setActiveOrder(null);
    }
  }, [currentTable?.currentOrderId, fetchActiveOrder]);

  const sendOrder = async (cart: CartItem[], customerId?: string) => {
    if (!cart.length) return false;
    if (!isCashShiftOpen) {
      toast.error('Caja cerrada: Debes abrir la caja antes de registrar pedidos o marchar comandas');
      return false;
    }
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

export default usePosTable;
