import { api } from '@/services/api';
import {
  ActiveShiftInfo,
  PendingBill,
  CloseShiftReportData,
  PaymentMethod,
} from '../types/cash-shifts.types';
import { usbPrinterService } from '@/services/usb-printer.service';

export const cashShiftsApi = {
  getCurrentShift: (venueId: string): Promise<ActiveShiftInfo> =>
    api.get(`/cash-shifts/current/${venueId}`),

  getPendingBills: (venueId: string): Promise<PendingBill[]> =>
    api.get(`/venues/${venueId}/pending-bills`),

  openShift: (payload: {
    venueId: string;
    cashierId?: string;
    openingAmount: number;
    notes?: string;
  }) => api.post('/cash-shifts/open', payload),

  closeShift: (shiftId: string, payload: { closingAmount: number; notes?: string }): Promise<CloseShiftReportData> =>
    api.post(`/cash-shifts/${shiftId}/close`, payload),

  processPayment: (payload: {
    orderId: string;
    payments: Array<{
      method: PaymentMethod;
      amount: number;
      reference?: string;
      tipAmount: number;
    }>;
  }) => api.post('/receipts', payload),

  printShiftSummary: async (shiftId: string) => {
    const res: any = await api.post('/hardware/print-shift-summary', { shiftId });
    if (res?.rawEscposBase64) {
      usbPrinterService.printRawEscpos(res.rawEscposBase64, res.printerName, res.paperWidth || '80').catch((err) => {
        console.warn('Error al imprimir cierre de caja USB:', err);
      });
    }
    return res;
  },

  printReceipt: async (receiptId: string) => {
    const res: any = await api.post('/hardware/print-receipt', { receiptId });
    if (res?.rawEscposBase64) {
      usbPrinterService.printRawEscpos(res.rawEscposBase64, res.printerName, res.paperWidth || '80').catch((err) => {
        console.warn('Error al imprimir comprobante USB:', err);
      });
    }
    return res;
  },

  openDrawer: (venueId: string) =>
    api.post('/hardware/open-drawer', { venueId }),
};
