import { z } from 'zod';

export const NewItemSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del insumo es obligatorio'),
  unit: z.string().min(1, 'Debes seleccionar una unidad de medida'),
  currentStock: z
    .string()
    .min(1, 'Ingresa el stock inicial')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'El stock debe ser un número igual o mayor a cero',
    }),
  alertThreshold: z
    .string()
    .min(1, 'Ingresa el umbral de alerta')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'El umbral debe ser un número igual o mayor a cero',
    }),
  costPerUnit: z
    .string()
    .min(1, 'Ingresa el costo unitario')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'El costo unitario debe ser un número mayor o igual a cero',
    }),
});

export type NewItemFormValues = z.infer<typeof NewItemSchema>;

export const NewSupplierSchema = z.object({
  name: z.string().trim().min(2, 'El nombre o razón social es obligatorio'),
  documentType: z.enum(['NIT', 'RUT', 'CC', 'CE', 'Passport']),
  documentNumber: z.string().trim().min(3, 'El número de documento es obligatorio'),
  contactName: z.string(),
  phone: z.string(),
  email: z
    .string()
    .email('Formato de correo inválido')
    .or(z.literal('')),
  address: z.string(),
  notes: z.string(),
});

export type NewSupplierFormValues = z.infer<typeof NewSupplierSchema>;

export const StockMovementSchema = z.object({
  movementType: z.enum(['in', 'out', 'waste', 'adjustment']),
  quantity: z
    .string()
    .min(1, 'Ingresa la cantidad')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'La cantidad debe ser mayor a 0',
    }),
  reason: z.string().trim().min(2, 'El motivo o justificación es obligatorio'),
});

export type StockMovementFormValues = z.infer<typeof StockMovementSchema>;
