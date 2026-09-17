import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { InventoryMovement, InventoryItem, MovementType } from '../types/inventory.types';
import { toast } from '@/components/ui/sonner';

export const useInventoryMovements = (venueId: string, onMovementSuccess?: () => void) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMovements = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await inventoryApi.getMovements(venueId);
      setMovements(data || []);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const openMovementModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowMovementModal(true);
  };

  const registerMovement = async (type: MovementType, quantity: string, notes?: string) => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.createMovement(venueId, {
        inventoryItemId: selectedItem.id,
        type,
        quantity,
        notes,
      });
      toast.success('Movimiento de inventario registrado');
      setShowMovementModal(false);
      setSelectedItem(null);
      fetchMovements();
      onMovementSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    movements,
    loading,
    showMovementModal,
    selectedItem,
    isSubmitting,
    openMovementModal,
    closeMovementModal: () => {
      setShowMovementModal(false);
      setSelectedItem(null);
    },
    registerMovement,
    refreshMovements: fetchMovements,
  };
};
