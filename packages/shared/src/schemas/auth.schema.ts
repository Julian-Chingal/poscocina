import { z } from 'zod';

export const PinLoginSchema = z.object({
  venueId: z.string().min(1),
  userId: z.string().min(1),
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'PIN must be 4 to 6 digits'),
  deviceId: z.string().optional(),
});

export type PinLoginInput = z.infer<typeof PinLoginSchema>;

export const PasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().optional(),
});

export type PasswordLoginInput = z.infer<typeof PasswordLoginSchema>;

export const DocumentLoginSchema = z.object({
  documentNumber: z.string().min(4, 'El documento debe tener al menos 4 caracteres').max(30),
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'El PIN debe contener entre 4 y 6 dígitos numéricos'),
  companyId: z.string().uuid().optional(),
  venueId: z.string().uuid().optional(),
  deviceId: z.string().optional(),
});

export type DocumentLoginInput = z.infer<typeof DocumentLoginSchema>;

export const SelectAuthContextSchema = z.object({
  selectionToken: z.string().min(1, 'Token de selección requerido'),
  userId: z.string().uuid('ID de usuario no válido'),
  companyId: z.string().uuid('ID de empresa no válido'),
  venueId: z.string().uuid('ID de sede no válido'),
});

export type SelectAuthContextInput = z.infer<typeof SelectAuthContextSchema>;

export const ManagerPinOverrideSchema = z.object({
  venueId: z.string().uuid(),
  managerPin: z.string().min(4).max(6).regex(/^\d+$/),
  action: z.string(),
  reason: z.string().min(3),
});

export type ManagerPinOverrideInput = z.infer<typeof ManagerPinOverrideSchema>;
