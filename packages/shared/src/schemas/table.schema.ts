import { z } from 'zod';

export const CreateFloorPlanSchema = z.object({
  venueId: z.string().uuid().optional(),
  name: z.string().min(2, 'El nombre del salón o planta es obligatorio'),
  layout: z.record(z.any()).optional().default({}),
});

export const CreateTableSchema = z.object({
  floorPlanId: z.string().uuid('ID de salón no válido'),
  label: z.string().min(1, 'La etiqueta de la mesa es obligatoria'),
  capacity: z.number().int().min(1).default(4),
  positionX: z.number().optional().default(0),
  positionY: z.number().optional().default(0),
  shape: z.enum(['rect', 'circle', 'square']).default('rect'),
});

export const UpdateTableSchema = z.object({
  label: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  shape: z.enum(['rect', 'circle', 'square']).optional(),
  status: z.enum(['free', 'occupied', 'check_requested', 'reserved', 'blocked']).optional(),
});

export type CreateFloorPlanInput = z.infer<typeof CreateFloorPlanSchema>;
export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;

export const TableTransferSchema = z.object({
  venueId: z.string().uuid().optional(),
  sourceTableId: z.string().uuid('ID de mesa origen no válido'),
  targetTableId: z.string().uuid('ID de mesa destino no válido'),
});

export type TableTransferInput = z.infer<typeof TableTransferSchema>;

export const TableMergeSchema = z.object({
  venueId: z.string().uuid().optional(),
  sourceTableId: z.string().uuid('ID de mesa origen no válido'),
  targetTableId: z.string().uuid('ID de mesa destino no válido'),
});

export type TableMergeInput = z.infer<typeof TableMergeSchema>;

