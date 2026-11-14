import { z } from 'zod';

export const DayScheduleSchema = z.object({
  day: z.number().min(0).max(6), // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  dayName: z.string(),
  enabled: z.boolean().default(true),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm requerido'),
});

export type DaySchedule = z.infer<typeof DayScheduleSchema>;

export const VenueOperatingStatusEnum = z.enum(['auto', 'open', 'closed']);
export type VenueOperatingStatus = z.infer<typeof VenueOperatingStatusEnum>;

export const CreateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  timezone: z.string().default('America/Bogota'),
  phone: z.string().optional(),
  slug: z.string().optional(),
  department: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  operatingStatus: VenueOperatingStatusEnum.optional().default('auto'),
  schedule: z.array(DayScheduleSchema).optional(),
  requireShiftForDelivery: z.boolean().optional().default(false),
  notes: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  companyId: z.string().uuid().optional(),
});

export const UpdateVenueSchema = z.object({
  name: z.string().min(2, 'El nombre de la sede debe tener al menos 2 caracteres').optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  phone: z.string().optional(),
  slug: z.string().optional(),
  department: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  managerName: z.string().optional(),
  openingHours: z.string().optional(),
  operatingStatus: VenueOperatingStatusEnum.optional(),
  schedule: z.array(DayScheduleSchema).optional(),
  requireShiftForDelivery: z.boolean().optional(),
  notes: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  companyId: z.string().uuid().optional(),
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
  operatingStatus: VenueOperatingStatusEnum.optional(),
  schedule: z.array(DayScheduleSchema).optional(),
  isOpen: z.boolean().default(true),
  requireShiftForDelivery: z.boolean().optional(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  settings: z.record(z.unknown()).optional(),
});
export type PublicVenue = z.infer<typeof PublicVenueSchema>;
