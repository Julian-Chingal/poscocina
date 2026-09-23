import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { Purchase } from '../types/inventory.types';
import { toast } from '@/components/ui/sonner';

export const usePurchases = (venueId: string, onPurchaseCreated?: () => void) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPurchases = useCallback(async () => {
    if (!venueId) return;
    try {
      const data = await inventoryApi.getPurchases(venueId);
      setPurchases(data || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const createPurchase = async (payload: {
    supplierId: string;
    invoiceNumber: string;
    status: 'received' | 'draft';
    notes?: string;
    items: Array<{ inventoryItemId: string; quantity: string; unitCost: string }>;
  }) => {
    setIsSubmitting(true);
    try {
      await inventoryApi.createPurchase(venueId, payload);
      toast.success('Factura de compra registrada exitosamente');
      setShowNewModal(false);
      fetchPurchases();
      onPurchaseCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar factura de compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const receivePurchase = async (purchaseId: string) => {
    try {
      await inventoryApi.receivePurchase(venueId, purchaseId);
      toast.success('Compra recibida y stock actualizado');
      fetchPurchases();
      onPurchaseCreated?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al recibir compra');
    }
  };

  return {
    purchases,
    loading,
    showNewModal,
    selectedDetail,
    isSubmitting,
    setShowNewModal,
    setSelectedDetail,
    createPurchase,
    receivePurchase,
    refreshPurchases: fetchPurchases,
  };
};

