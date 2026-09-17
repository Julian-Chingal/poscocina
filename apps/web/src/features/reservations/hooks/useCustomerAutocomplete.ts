import { useState, useEffect } from 'react';
import { reservationsApi } from '../api/reservations.api';
import { Customer } from '../types/reservations.types';

export const useCustomerAutocomplete = (venueId: string) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await reservationsApi.searchCustomers(venueId, query);
        setResults(data || []);
      } catch (err) {
        console.error('Customer search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, venueId]);

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setQuery('');
    setResults([]);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    selectedCustomer,
    selectCustomer,
    clearCustomer,
  };
};
