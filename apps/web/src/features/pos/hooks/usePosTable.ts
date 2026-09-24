import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Stable ref so fetchTables can read the latest currentTable without
  // adding it as a dependency (which caused the infinite loop).
  const currentTableRef = useRef<TableItem | null>(currentTable);
  useEffect(() => {
    currentTableRef.current = currentTable;
  }, [currentTable]);

  useEffect(() => {
    if (initialTable) setCurrentTable(initialTable);
  }, [initialTable]);

  const checkCashShift = useCallback(async () => {
    if (!venueId) return;
    await useShiftStore.getState().fetchCurrentShift(venueId);
  }, [venueId]);

  // ✅ currentTable removed from deps — read via ref instead to avoid the loop.
  const fetchTables = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await posApi.getTables(venueId);
      setAllTables(data || []);
      const latestTable = currentTableRef.current;
      if (latestTable) {
        const updated = data.find((t) => t.id === latestTable.id);
        if (updated) setCurrentTable(updated);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  }, [venueId]); // venueId only — no currentTable!

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

  // ✅ Both callbacks now have stable identities (only depend on venueId),
  // so this effect runs exactly once when venueId is available.
  useEffect(() => {
    checkCashShift();
    fetchTables();
  }, [checkCashShift, fetchTables]);

  // Load the active order whenever the selected table's order changes.
  // currentTable?.currentOrderId is a primitive (string | undefined), so it is
  // safe as a useEffect dependency — no new object reference per render.

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
        unitPrice: parseFloat(item.product.price) || 0,
        notes: item.notes || undefined,
        modifiers: item.modifiers || [],
      }));

      if (activeOrder?.id) {
        await posApi.appendOrderItems(activeOrder.id, itemsPayload);
      } else {
        await posApi.createOrder({
          venueId,
          tableId: currentTable?.id || undefined,
          waiterId: userId || undefined,
          customerId: customerId || undefined,
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
