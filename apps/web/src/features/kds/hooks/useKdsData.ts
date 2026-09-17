import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { kdsApi } from '../api/kds.api';
import { KdsOrder, KdsItem, StationFilter } from '../types/kds.types';

export const useKdsData = (venueId: string) => {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStation, setActiveStation] = useState<StationFilter>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Auto-refresh timer every 30s to advance elapsed minutes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await kdsApi.getOrders(venueId, activeStation);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching KDS orders:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId, activeStation]);

  useEffect(() => {
    fetchOrders();

    const socket = io();
    socket.emit('join:kds', activeStation);

    const refreshHandler = () => fetchOrders();

    socket.on('order:created', refreshHandler);
    socket.on('order:items_appended', refreshHandler);
    socket.on('kds:new_items', refreshHandler);
    socket.on('order_item:updated', refreshHandler);
    socket.on('order:status_updated', refreshHandler);

    return () => {
      socket.off('order:created', refreshHandler);
      socket.off('order:items_appended', refreshHandler);
      socket.off('kds:new_items', refreshHandler);
      socket.off('order_item:updated', refreshHandler);
      socket.off('order:status_updated', refreshHandler);
      socket.disconnect();
    };
  }, [fetchOrders, activeStation]);

  const handleNextStatus = async (item: KdsItem) => {
    let nextStatus: KdsItem['status'] = 'in_preparation';
    if (item.status === 'sent' || item.status === 'pending') {
      nextStatus = 'in_preparation';
    } else if (item.status === 'in_preparation') {
      nextStatus = 'ready';
    } else if (item.status === 'ready') {
      nextStatus = 'delivered';
    }

    try {
      await kdsApi.updateItemStatus(item.id, nextStatus);
      fetchOrders();
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };

  return {
    orders,
    loading,
    activeStation,
    setActiveStation,
    currentTime,
    handleNextStatus,
    refreshOrders: fetchOrders,
  };
};
