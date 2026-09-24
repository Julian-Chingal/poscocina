import { z } from 'zod';

export const CompanyFiscalSettingsSchema = z.object({
  regime: z.enum(['COMUN', 'SIMPLIFICADO', 'NO_RESPONSABLE_IVA', 'ESPECIAL']).default('SIMPLIFICADO'),
  taxType: z.enum(['INC_8', 'IVA_19', 'EXENTO']).default('INC_8'),
  taxRate: z.number().min(0).max(1).default(0.08),
  defaultTipPct: z.number().min(0).max(100).default(10),
  currency: z.string().default('COP'),
  isInvoiceResolutionEnabled: z.boolean().default(false),
  invoicePrefix: z.string().optional().nullable(),
  invoiceResolution: z.string().optional().nullable(),
  invoiceInitialNumber: z.number().int().optional().nullable(),
  invoiceFinalNumber: z.number().int().optional().nullable(),
  invoiceResolutionDate: z.string().optional().nullable(),
  receiptHeader: z.string().default('Sabor tradicional & Alta cocina'),
  receiptFooter: z.string().default('¡Gracias por su visita!'),
});

export const UpdateCompanySchema = z.object({
  legalName: z.string().min(2, 'La razón social debe tener al menos 2 caracteres').optional(),
  tradeName: z.string().min(2, 'El nombre comercial debe tener al menos 2 caracteres').optional(),
  taxId: z.string().min(3, 'El NIT/RUT debe tener al menos 3 caracteres').optional(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hex no válido').optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email no válido').or(z.literal('')).optional().nullable(),
  address: z.string().optional().nullable(),
  fiscal: CompanyFiscalSettingsSchema.partial().optional(),
}).superRefine((data, ctx) => {
  if (data.fiscal?.isInvoiceResolutionEnabled) {
    const f = data.fiscal;
    if (!f.invoicePrefix || f.invoicePrefix.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El prefijo de factura es obligatorio cuando la resolución fiscal está activa',
        path: ['fiscal', 'invoicePrefix'],
      });
    }
    if (!f.invoiceResolution || f.invoiceResolution.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de resolución es obligatorio cuando la resolución fiscal está activa',
        path: ['fiscal', 'invoiceResolution'],
      });
    }
    if (f.invoiceInitialNumber === undefined || f.invoiceInitialNumber === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El rango inicial es obligatorio cuando la resolución fiscal está activa',
        path: ['fiscal', 'invoiceInitialNumber'],
      });
    }
    if (f.invoiceFinalNumber === undefined || f.invoiceFinalNumber === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El rango final es obligatorio cuando la resolución fiscal está activa',
        path: ['fiscal', 'invoiceFinalNumber'],
      });
    }
    if (
      typeof f.invoiceInitialNumber === 'number' &&
      typeof f.invoiceFinalNumber === 'number' &&
      f.invoiceFinalNumber <= f.invoiceInitialNumber
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El rango final debe ser mayor que el rango inicial',
        path: ['fiscal', 'invoiceFinalNumber'],
      });
    }
  }
});

export type CompanyFiscalSettings = z.infer<typeof CompanyFiscalSettingsSchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
