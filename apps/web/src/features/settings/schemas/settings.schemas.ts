import { z } from 'zod';

export const NewVenueSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .trim()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'),
  address: z.string(),
  phone: z.string(),
});

export type NewVenueFormValues = z.infer<typeof NewVenueSchema>;

export const PrinterSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la impresora es obligatorio'),
  station: z.enum(['kitchen', 'bar', 'dessert', 'cashier', 'expediter']),
  connectionType: z.enum(['network_tcp', 'browser_raw', 'disabled']),
  ipAddress: z.string(),
  port: z.number().min(1).max(65535),
  paperWidth: z.enum(['80', '58']),
  autoPrintOnOrder: z.boolean(),
  autoPrintOnPayment: z.boolean(),
  openDrawerOnPrint: z.boolean(),
});

export type PrinterFormValues = z.infer<typeof PrinterSchema>;
