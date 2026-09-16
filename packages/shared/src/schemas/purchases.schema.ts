import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  venueId: z.string().uuid('ID de local invalido'),
  name: z.string().min(2, 'El nombre o razon social es obligatorio'),
  documentType: z.enum(['NIT', 'RUT', 'CC', 'CE', 'Passport']).default('NIT'),
  documentNumber: z.string().min(3, 'El numero de documento/NIT es obligatorio'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Correo electronico invalido').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial().omit({ venueId: true });

export const PurchaseItemInputSchema = z.object({
  inventoryItemId: z.string().uuid('ID de insumo invalido'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitCost: z.number().nonnegative('El costo unitario no puede ser negativo'),
});

export const CreatePurchaseSchema = z.object({
  venueId: z.string().uuid('ID de local invalido'),
  supplierId: z.string().uuid('ID de proveedor invalido'),
  invoiceNumber: z.string().min(1, 'El numero de factura o remision es obligatorio'),
  purchaseDate: z.string().datetime().optional(),
  status: z.enum(['draft', 'received']).default('received'),
  notes: z.string().optional(),
  items: z.array(PurchaseItemInputSchema).min(1, 'Debe incluir al menos un insumo en la compra'),
});

export const UpdatePurchaseStatusSchema = z.object({
  status: z.enum(['draft', 'received', 'cancelled']),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
export type PurchaseItemInput = z.infer<typeof PurchaseItemInputSchema>;
export type CreatePurchaseInput = z.infer<typeof CreatePurchaseSchema>;
export type UpdatePurchaseStatusInput = z.infer<typeof UpdatePurchaseStatusSchema>;
