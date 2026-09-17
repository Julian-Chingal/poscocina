import { api } from '@/services/api';
import {
  ActiveShiftInfo,
  PendingBill,
  CloseShiftReportData,
  PaymentMethod,
} from '../types/cash-shifts.types';

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

  printShiftSummary: (shiftId: string) =>
    api.post('/hardware/print-shift-summary', { shiftId }),

  printReceipt: (receiptId: string) =>
    api.post('/hardware/print-receipt', { receiptId }),

  openDrawer: (venueId: string) =>
    api.post('/hardware/open-drawer', { venueId }),
};
