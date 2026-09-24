import { api } from '@/services/api';
import {
  PrinterDevice,
  PrinterFormData,
  TestPrintResult,
  VenueSummaryData,
  NewVenuePayload,
} from '../types/settings.types';

export const settingsApi = {
  getPrinters: (venueId: string): Promise<PrinterDevice[]> =>
    api.get(`/hardware/printers?venueId=${venueId}`),

  savePrinter: (
    venueId: string,
    data: PrinterFormData,
    printerId?: string | null
  ): Promise<PrinterDevice> => {
    const payload = { ...data, venueId, port: Number(data.port) || 9100 };
    return printerId
      ? api.put(`/hardware/printers/${printerId}`, payload)
      : api.post('/hardware/printers', payload);
  },

  deletePrinter: (printerId: string): Promise<{ success: boolean }> =>
    api.delete(`/hardware/printers/${printerId}`),

  testPrint: async (venueId: string, printerId: string): Promise<TestPrintResult> => {
    try {
      const data = await api.post(`/hardware/test-print?venueId=${venueId}`, { printerId });
      return {
        id: printerId,
        success: true,
        msg: data.networkSent
          ? 'Ticket enviado con éxito por red TCP'
          : 'Ticket generado exitosamente (Navegador/USB)',
      };
    } catch (err: any) {
      return {
        id: printerId,
        success: false,
        msg: err?.message || 'Error en prueba de impresión',
      };
    }
  },

  getVenueSummary: (venueId: string): Promise<VenueSummaryData> =>
    api.get(`/venues/${venueId}/summary`),

  createVenue: (payload: NewVenuePayload) => api.post('/venues', payload),

  toggleVenueStatus: (venueId: string, isActive: boolean) =>
    api.patch(`/venues/${venueId}/status`, { isActive }),

  deleteVenue: (venueId: string) =>
    api.delete(`/venues/${venueId}`),
};

