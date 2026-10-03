import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { kdsApi } from '../api/kds.api';
import { KdsOrder, KdsItem, StationFilter } from '../types/kds.types';

export const useKdsData = (venueId: string) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeStation, setActiveStation] = useState<StationFilter>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const activeStationRef = useRef<StationFilter>(activeStation);
  activeStationRef.current = activeStation;

  // Advance elapsed minutes timer every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async (isBackground = false) => {
    if (!venueId) return;
    if (!isBackground) setIsSyncing(true);
    try {
      const data = await kdsApi.getOrders(venueId, activeStationRef.current);
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('⚠️ [KDS] Error al consultar comandas (conservando datos anteriores):', err);
      // NOTE: Do NOT reset orders to [] to prevent blank screens on transient network hiccups
    } finally {
      setLoading(false);
      if (!isBackground) setIsSyncing(false);
    }
  }, [venueId]);

  // Refetch when activeStation changes
  useEffect(() => {
    fetchOrders();
    if (socketRef.current?.connected) {
      socketRef.current.emit('join:kds', activeStation);
    }
  }, [activeStation, fetchOrders]);

  // Persistent socket connection + fallback polling + focus refetch
  useEffect(() => {
    if (!venueId) return;

    // 1. Singleton Socket.IO initialization with exponential backoff
    const socket = io({
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:venue', venueId);
      socket.emit('join:kds', activeStationRef.current);
      fetchOrders(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      setIsConnected(true);
      socket.emit('join:venue', venueId);
      socket.emit('join:kds', activeStationRef.current);
      fetchOrders(true);
    });

    const refreshHandler = () => fetchOrders(true);

    socket.on('order:created', refreshHandler);
    socket.on('order:items_appended', refreshHandler);
    socket.on('kds:new_items', refreshHandler);
    socket.on('order_item:updated', refreshHandler);
    socket.on('order:status_updated', refreshHandler);
    socket.on('kds:item_updated', refreshHandler);
    socket.on('kds:item_removed', refreshHandler);
    socket.on('order:totals_updated', refreshHandler);

    // 2. Passive 10-second heartbeat polling fallback for resilient consistency
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    // 3. Window focus and online listeners to guarantee instantaneous recovery
    const handleFocus = () => fetchOrders(true);
    const handleOnline = () => fetchOrders(true);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);

      socket.off('order:created', refreshHandler);
      socket.off('order:items_appended', refreshHandler);
      socket.off('kds:new_items', refreshHandler);
      socket.off('order_item:updated', refreshHandler);
      socket.off('order:status_updated', refreshHandler);
      socket.off('kds:item_updated', refreshHandler);
      socket.off('kds:item_removed', refreshHandler);
      socket.off('order:totals_updated', refreshHandler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [venueId, fetchOrders]);

  // Forward state progression: pending/sent -> in_preparation -> ready -> delivered
  const handleNextStatus = async (item: KdsItem) => {
    let nextStatus: KdsItem['status'] = 'in_preparation';
    if (item.status === 'sent' || item.status === 'pending') {
      nextStatus = 'in_preparation';
    } else if (item.status === 'in_preparation') {
      nextStatus = 'ready';
    } else if (item.status === 'ready') {
      nextStatus = 'delivered';
    }

    // Optimistic local update
    setOrders((prevOrders) =>
      prevOrders.map((ord) => ({
        ...ord,
        items: ord.items.map((i) =>
          i.id === item.id ? { ...i, status: nextStatus } : i
        ),
      }))
    );

    try {
      await kdsApi.updateItemStatus(item.id, nextStatus);
      fetchOrders(true);
    } catch (err: any) {
      console.error('Error advancing item status:', err);
      // Rollback on failure
      fetchOrders();
    }
  };

  // Reverse state progression (Undo / Rollback): delivered -> ready -> in_preparation -> sent
  const handleUndoStatus = async (item: KdsItem) => {
    let prevStatus: KdsItem['status'] | null = null;
    if (item.status === 'delivered') {
      prevStatus = 'ready';
    } else if (item.status === 'ready') {
      prevStatus = 'in_preparation';
    } else if (item.status === 'in_preparation') {
      prevStatus = 'sent';
    }

    if (!prevStatus) return;

    // Optimistic local rollback
    setOrders((prevOrders) =>
      prevOrders.map((ord) => ({
        ...ord,
        items: ord.items.map((i) =>
          i.id === item.id ? { ...i, status: prevStatus! } : i
        ),
      }))
    );

    try {
      await kdsApi.updateItemStatus(item.id, prevStatus);
      fetchOrders(true);
    } catch (err: any) {
      console.error('Error reverting item status:', err);
      // Rollback on failure
      fetchOrders();
    }
  };

  // Mark all unready items in an order ready, or if all ready, mark all delivered
  const handleCompleteOrder = async (order: KdsOrder) => {
    const hasUnready = order.items.some(
      (it) => it.status === 'pending' || it.status === 'sent' || it.status === 'in_preparation'
    );
    const targetStatus: KdsItem['status'] = hasUnready ? 'ready' : 'delivered';

    // Optimistic update
    setOrders((prevOrders) =>
      prevOrders.map((ord) =>
        ord.id === order.id
          ? {
              ...ord,
              items: ord.items.map((i) =>
                targetStatus === 'delivered' || (i.status !== 'ready' && i.status !== 'delivered')
                  ? { ...i, status: targetStatus }
                  : i
              ),
            }
          : ord
      )
    );

    try {
      const itemsToUpdate = order.items.filter((it) =>
        targetStatus === 'ready'
          ? it.status !== 'ready' && it.status !== 'delivered'
          : it.status !== 'delivered'
      );
      await Promise.all(
        itemsToUpdate.map((it) => kdsApi.updateItemStatus(it.id, targetStatus))
      );
      fetchOrders(true);
    } catch (err) {
      console.error('Error completing all items in order:', err);
      fetchOrders();
    }
  };

  return {
    orders,
    loading,
    isSyncing,
    isConnected,
    activeStation,
    setActiveStation,
    currentTime,
    handleNextStatus,
    handleUndoStatus,
    handleCompleteOrder,
    refreshOrders: fetchOrders,
  };
};
