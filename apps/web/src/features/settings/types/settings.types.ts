import { VenueItem } from '@/stores/branding.store';

export type SettingsTab = 'identity' | 'tax' | 'printer' | 'venues';
export type PrinterStation = 'cashier' | 'kitchen' | 'bar' | 'dessert' | 'expediter';
export type PrinterConnectionType = 'network_tcp' | 'browser_raw' | 'disabled';
export type TaxType = 'INC_8' | 'IVA_19' | 'EXENTO';
export type PaperWidth = 58 | 80;

export interface PrinterDevice {
  id: string;
  venueId: string;
  name: string;
  station: PrinterStation;
  connectionType: PrinterConnectionType;
  ipAddress?: string;
  port: number;
  paperWidth: '58' | '80';
  autoPrintOnOrder: boolean;
  autoPrintOnPayment: boolean;
  openDrawerOnPrint: boolean;
}

export interface PrinterFormData extends Omit<PrinterDevice, 'id' | 'venueId'> {
  id?: string;
}

export interface TestPrintResult {
  id: string;
  success: boolean;
  msg: string;
}

export interface VenueSummaryData {
  venue: VenueItem;
  stats: {
    tables: { total: number; free: number; occupied: number };
    activeOrders: number;
    activeStaff: number;
    openShift: { id: string; openedAt: string; cashierName: string } | null;
  };
}

export interface NewVenuePayload {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
}
