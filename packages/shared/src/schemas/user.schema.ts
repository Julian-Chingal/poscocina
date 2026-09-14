import { z } from 'zod';

export const CreateUserSchema = z.object({
  venueId: z.string().uuid().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico no válido').optional().or(z.literal('')),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  pin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 dígitos numéricos'),
  roleId: z.string().uuid('ID de rol no válido'),
  avatarUrl: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6).optional(),
  roleId: z.string().uuid().optional(),
  avatarUrl: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const ResetPinSchema = z.object({
  newPin: z.string().regex(/^\d{4,6}$/, 'El PIN debe contener entre 4 y 6 dígitos numéricos'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ResetPinInput = z.infer<typeof ResetPinSchema>;
