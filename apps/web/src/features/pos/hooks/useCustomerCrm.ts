import { useState, useEffect } from 'react';
import { posApi } from '../api/pos.api';
import { Customer } from '../types/pos.types';
import { toast } from '@/components/ui/sonner';

export const useCustomerCrm = (venueId: string, orderId?: string | null) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await posApi.searchCustomers(venueId, searchQuery);
        setSearchResults(data || []);
      } catch (err) {
        console.error('Customer search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, venueId]);

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (orderId) {
      try {
        await posApi.linkCustomerToOrder(orderId, customer.id);
        toast.success(`Cliente ${customer.name} vinculado a la orden`);
      } catch {
        toast.error('No se pudo vincular el cliente a la orden');
      }
    }
  };

  const createCustomer = async (payload: {
    name: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const created = await posApi.createCustomer({ ...payload, venueId });
      toast.success('Cliente registrado exitosamente');
      setShowCreateModal(false);
      selectCustomer(created);
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedCustomer,
    searchQuery,
    searchResults,
    showSearchDropdown,
    showCreateModal,
    isSubmitting,
    setSelectedCustomer,
    setSearchQuery,
    setShowSearchDropdown,
    setShowCreateModal,
    selectCustomer,
    createCustomer,
    clearCustomer: () => setSelectedCustomer(null),
  };
};
