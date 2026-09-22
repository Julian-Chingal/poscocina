export interface PrinterRecord {
  id: string;
  venueId: string;
  name: string;
  station: 'kitchen' | 'bar' | 'dessert' | 'cashier';
  connectionType: 'network_tcp' | 'usb_raw' | 'bluetooth' | 'serial' | 'system_spooler';
  ipAddress: string | null;
  port: number;
  paperWidth: '58' | '80';
  autoPrintOnOrder: boolean;
  autoPrintOnPayment: boolean;
  openDrawerOnPrint: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrinterRepository {
  findPrintersByVenue(venueId: string): Promise<PrinterRecord[]>;
  findPrinterById(id: string): Promise<PrinterRecord | null>;
  createPrinter(data: any): Promise<PrinterRecord>;
  updatePrinter(id: string, data: any): Promise<PrinterRecord>;
  deletePrinter(id: string): Promise<void>;
  findOrderForPrint(orderId: string): Promise<any>;
  findReceiptForPrint(receiptId: string): Promise<any>;
  findCashShiftForPrint(shiftId: string): Promise<any>;
}

export interface IPrinterDriver {
  sendToNetworkPrinter(ip: string, port: number, buffer: Buffer): Promise<{ success: boolean; error?: string; bytesWritten?: number }>;
  generateKitchenTicket(params: any): { escposBuffer: Buffer; asciiPreview: string };
  generateReceiptTicket(params: any): { escposBuffer: Buffer; asciiPreview: string };
  generatePreCheckTicket(params: any): { escposBuffer: Buffer; asciiPreview: string };
  generateShiftSummaryTicket(params: any): { escposBuffer: Buffer; asciiPreview: string };
  generateTestTicket(printerName: string, ip?: string | null, paperWidth?: '58' | '80'): { escposBuffer: Buffer; asciiPreview: string };
}
