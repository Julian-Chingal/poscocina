import { z } from 'zod';

export const FloorPlanSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

export type FloorPlanFormValues = z.infer<typeof FloorPlanSchema>;

export const TableSchema = z.object({
  label: z.string().trim().min(1, 'El nombre de la mesa es obligatorio'),
  floorPlanId: z.string(),
  capacity: z.number().min(1, 'Capacidad mínima 1').max(30, 'Capacidad máxima 30'),
  shape: z.enum(['rect', 'circle', 'square']),
  status: z.enum(['free', 'occupied', 'check_requested', 'reserved', 'blocked']),
});

export type TableFormValues = z.infer<typeof TableSchema>;
