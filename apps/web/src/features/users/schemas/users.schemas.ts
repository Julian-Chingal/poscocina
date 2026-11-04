import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    documentNumber: z
      .string()
      .trim()
      .min(4, 'El número de documento debe tener al menos 4 dígitos')
      .max(30, 'El documento no puede exceder 30 caracteres')
      .regex(/^[0-9a-zA-Z.-]+$/, 'Solo caracteres alfanuméricos válidos para documento'),
    roleId: z.string().min(1, 'Debes seleccionar un rol'),
    companyId: z.string().optional(),
    venueId: z.string().optional(),
    pin: z
      .string()
      .regex(/^\d{4,6}$/, 'El PIN debe ser numérico de 4 a 6 dígitos'),
    email: z
      .string()
      .email('Formato de correo electrónico inválido')
      .optional()
      .or(z.literal('')),
    password: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.email && data.email.trim() !== '') {
        return Boolean(data.password && data.password.trim().length >= 6);
      }
      return true;
    },
    {
      message: 'La contraseña maestra es obligatoria (mínimo 6 caracteres) si se especifica correo',
      path: ['password'],
    }
  );

export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;

export const EditUserSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  documentNumber: z
    .string()
    .trim()
    .min(4, 'El número de documento debe tener al menos 4 caracteres')
    .max(30, 'El documento no puede exceder 30 caracteres')
    .optional()
    .or(z.literal('')),
  roleId: z.string().min(1, 'Debes seleccionar un rol'),
  email: z
    .string()
    .email('Formato de correo electrónico inválido')
    .or(z.literal('')),
  isActive: z.boolean(),
});

export type EditUserFormValues = z.infer<typeof EditUserSchema>;

export const ResetPinSchema = z.object({
  newPin: z
    .string()
    .regex(/^\d{4,6}$/, 'El PIN debe ser numérico de 4 a 6 dígitos'),
});

export type ResetPinFormValues = z.infer<typeof ResetPinSchema>;
