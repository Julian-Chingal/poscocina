import { api } from '@/services/api';
import { Customer, TableItem } from '../types/pos.types';
import { usbPrinterService } from '@/services/usb-printer.service';

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

  printReceipt: async (receiptId: string) => {
    const res: any = await api.post('/hardware/print-receipt', { receiptId });
    if (res?.rawEscposBase64) {
      usbPrinterService.printRawEscpos(res.rawEscposBase64, res.ipAddress || res.printerName, res.paperWidth || '80').catch((err) => {
        console.warn('Error al imprimir comprobante USB:', err);
      });
    }
    return res;
  },

  printKitchen: async (orderId: string, specificStation?: string, isAppend?: boolean) => {
    const res: any = await api.post('/hardware/print-kitchen', { orderId, specificStation, isAppend });
    if (Array.isArray(res)) {
      for (const item of res) {
        if (item?.rawEscposBase64) {
          usbPrinterService.printRawEscpos(item.rawEscposBase64, item.ipAddress || item.printerName, item.paperWidth || '80').catch((err) => {
            console.warn('Error al imprimir comanda USB:', err);
          });
        }
      }
    }
    return res;
  },

  printPreCheck: async (orderId: string) => {
    const res: any = await api.post('/hardware/print-precheck', { orderId });
    if (res?.rawEscposBase64) {
      usbPrinterService.printRawEscpos(res.rawEscposBase64, res.ipAddress || res.printerName, res.paperWidth || '80').catch((err) => {
        console.warn('Error al imprimir pre-cuenta USB:', err);
      });
    }
    return res;
  },

  openDrawer: (venueId: string) =>
    api.post('/hardware/open-drawer', { venueId }),

  modifyOrderItem: (itemId: string, data: any) =>
    api.patch(`/order-items/${itemId}`, data),

  deleteOrderItem: (itemId: string, kitchenApproved = false) =>
    api.delete(`/order-items/${itemId}?kitchenApproved=${kitchenApproved}`),

  managerOverride: (payload: {
    venueId: string;
    managerPin: string;
    action: string;
    reason: string;
  }): Promise<{ authorized: boolean; managerId: string; managerName: string; action: string }> =>
    api.post('/auth/manager-override', payload),
};
