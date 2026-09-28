import { z } from 'zod';

export const NewVenueSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .trim()
    .min(2, 'El identificador debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El identificador solo puede contener minúsculas, números y guiones'),
  address: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  notes: z.string().optional(),
  timezone: z.string().optional(),
});

export type NewVenueFormValues = z.infer<typeof NewVenueSchema>;

export const EditVenueSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .trim()
    .min(2, 'El identificador debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El identificador solo puede contener minúsculas, números y guiones'),
  address: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  notes: z.string().optional(),
  timezone: z.string().optional(),
});

export type EditVenueFormValues = z.infer<typeof EditVenueSchema>;

export const PrinterSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la impresora es obligatorio'),
  station: z.enum(['kitchen', 'bar', 'dessert', 'cashier', 'expediter']),
  connectionType: z.enum(['network_tcp', 'bluetooth', 'usb_direct', 'browser_raw', 'disabled', 'zogui_bridge']),
  ipAddress: z.string().optional(),
  port: z.number().min(1).max(65535),
  paperWidth: z.enum(['80', '58']),
  autoPrintOnOrder: z.boolean(),
  autoPrintOnPayment: z.boolean(),
  openDrawerOnPrint: z.boolean(),
  isTabletDefault: z.boolean().optional(),
});

export type PrinterFormValues = z.infer<typeof PrinterSchema>;
