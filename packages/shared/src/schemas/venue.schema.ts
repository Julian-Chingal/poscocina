import { z } from 'zod';

export const CreateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  timezone: z.string().default('America/Bogota'),
  settings: z.record(z.unknown()).optional(),
});

export const UpdateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres').optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;
