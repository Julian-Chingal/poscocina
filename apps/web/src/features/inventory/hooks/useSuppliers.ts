import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { Supplier, SupplierDocType } from '../types/inventory.types';
import { toast } from '@/components/ui/sonner';

export const useSuppliers = (venueId: string) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuppliers = useCallback(async (query = '') => {
    if (!venueId) return;
    try {
      const data = await inventoryApi.getSuppliers(venueId, query);
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchSuppliers(searchQuery);
  }, [venueId, searchQuery, fetchSuppliers]);

  const createSupplier = async (data: {
    name: string;
    documentType: SupplierDocType;
    documentNumber: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await inventoryApi.createSupplier(venueId, data);
      toast.success('Proveedor registrado con éxito');
      setShowModal(false);
      fetchSuppliers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    suppliers,
    searchQuery,
    loading,
    showModal,
    isSubmitting,
    setSearchQuery,
    setShowModal,
    createSupplier,
    refreshSuppliers: () => fetchSuppliers(searchQuery),
  };
};
