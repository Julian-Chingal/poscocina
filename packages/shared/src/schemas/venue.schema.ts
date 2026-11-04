import { z } from 'zod';

export const CreateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  timezone: z.string().default('America/Bogota'),
  phone: z.string().optional(),
  slug: z.string().optional(),
  city: z.string().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  notes: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const UpdateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres').optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  phone: z.string().optional(),
  slug: z.string().optional(),
  city: z.string().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  notes: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;
export type UpdateVenueInput = z.infer<typeof UpdateVenueSchema>;

export const ToggleVenueStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'El estado isActive es requerido' }),
});
export type ToggleVenueStatusInput = z.infer<typeof ToggleVenueStatusSchema>;

export const PublicVenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().nullable().optional(),
  openingHours: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  settings: z.record(z.unknown()).optional(),
});
export type PublicVenue = z.infer<typeof PublicVenueSchema>;
