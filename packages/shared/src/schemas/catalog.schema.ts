import { z } from 'zod';

export const CreateCategorySchema = z.object({
  venueId: z.string().uuid().optional(),
  name: z.string().min(2, 'El nombre de categoría es obligatorio'),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
  printerStation: z.string().optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  printerStation: z.string().optional().nullable(),
});

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid('ID de categoría no válido'),
  name: z.string().min(2, 'El nombre del producto es obligatorio'),
  description: z.string().optional(),
  price: z.number().positive('El precio debe ser un valor positivo'),
  taxRate: z.number().min(0).max(1).default(0.08),
  imageUrl: z.string().optional().nullable(),
  printerStation: z.string().optional().nullable(),
  prepTimeMin: z.number().int().min(0).optional().nullable(),
  trackInventory: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const UpdateProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  imageUrl: z.string().optional().nullable(),
  printerStation: z.string().optional().nullable(),
  prepTimeMin: z.number().int().min(0).optional().nullable(),
  trackInventory: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// Modifiers & Toppings Schemas
export const CreateModifierGroupSchema = z.object({
  name: z.string().min(1, 'El nombre del grupo es obligatorio'),
  selectionType: z.enum(['single', 'multiple']).default('single'),
  isRequired: z.boolean().default(false),
  minSelections: z.number().int().min(0).default(0),
  maxSelections: z.number().int().min(1).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const UpdateModifierGroupSchema = CreateModifierGroupSchema.partial();

export const CreateModifierSchema = z.object({
  name: z.string().min(1, 'El nombre del modificador es obligatorio'),
  priceDelta: z.number().min(0).default(0),
  isDefault: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const UpdateModifierSchema = CreateModifierSchema.partial();

export const LinkProductModifierGroupSchema = z.object({
  groupId: z.string().uuid('ID de grupo inválido'),
  isRequired: z.boolean().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export type CreateModifierGroupInput = z.infer<typeof CreateModifierGroupSchema>;
export type UpdateModifierGroupInput = z.infer<typeof UpdateModifierGroupSchema>;
export type CreateModifierInput = z.infer<typeof CreateModifierSchema>;
export type UpdateModifierInput = z.infer<typeof UpdateModifierSchema>;
export type LinkProductModifierGroupInput = z.infer<typeof LinkProductModifierGroupSchema>;

