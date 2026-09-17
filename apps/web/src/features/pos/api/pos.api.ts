import { api } from '@/services/api';
import { Customer, TableItem } from '../types/pos.types';

export const posApi = {
  getCatalog: (venueId: string) => api.get(`/venues/${venueId}/catalog`),

  getCashShift: (venueId: string) => api.get(`/cash-shifts/current/${venueId}`),

  getTables: (venueId: string): Promise<TableItem[]> => api.get(`/venues/${venueId}/tables`),

  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),

  searchCustomers: (venueId: string, query: string): Promise<Customer[]> =>
    api.get(`/customers/search?venueId=${venueId}&query=${encodeURIComponent(query)}`),

  createCustomer: (payload: {
    venueId: string;
    name: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Promise<Customer> => api.post('/customers', payload),

  linkCustomerToOrder: (orderId: string, customerId: string) =>
    api.post(`/orders/${orderId}/customer`, { customerId }),

  createOrder: (payload: any) => api.post('/orders', payload),

  appendOrderItems: (orderId: string, items: any[]) =>
    api.post(`/orders/${orderId}/items`, { items }),

  requestCheck: (orderId: string) => api.post(`/orders/${orderId}/request-check`),

  processPayment: (payload: any) => api.post('/receipts', payload),

  printReceipt: (receiptId: string) =>
    api.post('/hardware/print-receipt', { receiptId }),

  openDrawer: (venueId: string) =>
    api.post('/hardware/open-drawer', { venueId }),
};
