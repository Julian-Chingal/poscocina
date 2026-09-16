import { z } from 'zod';

export const PrinterStationEnum = z.enum([
  'cashier',
  'kitchen',
  'bar',
  'dessert',
  'expediter',
]);

export const PrinterConnectionTypeEnum = z.enum([
  'network_tcp',
  'browser_raw',
  'disabled',
]);

export const CreatePrinterSchema = z.object({
  venueId: z.string().uuid('ID de local inválido'),
  name: z.string().min(2, 'El nombre de la impresora es obligatorio'),
  station: PrinterStationEnum.default('kitchen'),
  connectionType: PrinterConnectionTypeEnum.default('network_tcp'),
  ipAddress: z.string().optional().nullable(),
  port: z.number().int().positive().default(9100),
  paperWidth: z.enum(['58', '80']).default('80'),
  autoPrintOnOrder: z.boolean().default(true),
  autoPrintOnPayment: z.boolean().default(true),
  openDrawerOnPrint: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const UpdatePrinterSchema = CreatePrinterSchema.partial().omit({ venueId: true });

export const TestPrintSchema = z.object({
  printerId: z.string().uuid().optional(),
  connectionType: PrinterConnectionTypeEnum.optional(),
  ipAddress: z.string().optional(),
  port: z.number().int().optional(),
  paperWidth: z.enum(['58', '80']).optional(),
});

export const PrintKitchenTicketSchema = z.object({
  orderId: z.string().uuid('ID de orden inválido'),
  station: PrinterStationEnum.optional(),
  isAppend: z.boolean().optional(),
});

export const PrintReceiptSchema = z.object({
  receiptId: z.string().uuid('ID de recibo inválido'),
  printerId: z.string().uuid().optional(),
});

export const PrintPreCheckSchema = z.object({
  orderId: z.string().uuid('ID de orden inválido'),
  printerId: z.string().uuid().optional(),
});

export const PrintShiftSummarySchema = z.object({
  shiftId: z.string().uuid('ID de turno inválido'),
  printerId: z.string().uuid().optional(),
});

export type PrinterStation = z.infer<typeof PrinterStationEnum>;
export type PrinterConnectionType = z.infer<typeof PrinterConnectionTypeEnum>;
export type CreatePrinterInput = z.infer<typeof CreatePrinterSchema>;
export type UpdatePrinterInput = z.infer<typeof UpdatePrinterSchema>;
export type TestPrintInput = z.infer<typeof TestPrintSchema>;
export type PrintKitchenTicketInput = z.infer<typeof PrintKitchenTicketSchema>;
export type PrintReceiptInput = z.infer<typeof PrintReceiptSchema>;
export type PrintPreCheckInput = z.infer<typeof PrintPreCheckSchema>;
export type PrintShiftSummaryInput = z.infer<typeof PrintShiftSummarySchema>;
