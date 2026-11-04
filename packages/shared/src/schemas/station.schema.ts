import { z } from 'zod';

export const StationSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  color: z.string().max(20).default('#ea580c'),
  icon: z.string().max(50).default('ChefHat'),
  printerId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const CreateStationSchema = z.object({
  venueId: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  code: z.string().min(1, 'El código es obligatorio').max(50).regex(/^[a-z0-9_-]+$/, 'El código debe contener solo letras minúsculas, números, guiones o guiones bajos'),
  description: z.string().optional().nullable(),
  color: z.string().max(20).optional().default('#ea580c'),
  icon: z.string().max(50).optional().default('ChefHat'),
  printerId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const UpdateStationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, 'El código debe contener solo letras minúsculas, números, guiones o guiones bajos').optional(),
  description: z.string().optional().nullable(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  printerId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const UpdateOrderItemStationStatusSchema = z.object({
  status: z.enum(['pending', 'in_preparation', 'ready', 'delivered']),
});

export type Station = z.infer<typeof StationSchema>;
export type CreateStationInput = z.infer<typeof CreateStationSchema>;
export type UpdateStationInput = z.infer<typeof UpdateStationSchema>;
export type UpdateOrderItemStationStatusInput = z.infer<typeof UpdateOrderItemStationStatusSchema>;
