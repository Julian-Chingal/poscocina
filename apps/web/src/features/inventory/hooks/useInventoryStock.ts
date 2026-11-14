import { useState, useEffect, useCallback, useMemo } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { InventoryItem } from '../types/inventory.types';
import { toast } from '@/components/ui/sonner';
import { getAppSocket } from '@/lib/socket';

export const useInventoryStock = (venueId: string) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await inventoryApi.getItems(venueId);
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchItems();
    const socket = getAppSocket();
    socket.on('stock:alert', fetchItems);
    socket.on('order:status_changed', fetchItems);

    return () => {
      socket.off('stock:alert', fetchItems);
      socket.off('order:status_changed', fetchItems);
    };
  }, [venueId, fetchItems]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const createItem = async (data: {
    name: string;
    unit: string;
    currentStock: string;
    alertThreshold: string;
    costPerUnit: string;
  }) => {
    setIsSubmitting(true);
    try {
      await inventoryApi.createItem(venueId, data);
      toast.success('Insumo registrado con éxito');
      setShowNewItemModal(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear insumo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    items,
    filteredItems,
    searchQuery,
    loading,
    showNewItemModal,
    isSubmitting,
    setSearchQuery,
    setShowNewItemModal,
    createItem,
    refreshItems: fetchItems,
  };
};
