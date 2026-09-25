import { z } from 'zod';

export const CategorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z.string(),
  printerStation: z.string(),
  sortOrder: z.number(),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export const ProductSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del producto es obligatorio'),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría'),
  price: z
    .string()
    .min(1, 'El precio es obligatorio')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Ingresa un precio válido mayor a 0',
    }),
  taxRate: z.number(),
  printerStation: z.string(),
  description: z.string(),
  prepTimeMin: z.number().min(0, 'El tiempo debe ser mayor o igual a 0'),
  trackInventory: z.boolean(),
  isAvailable: z.boolean(),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;
