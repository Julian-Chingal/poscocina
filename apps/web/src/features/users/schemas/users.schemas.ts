import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    roleId: z.string().min(1, 'Debes seleccionar un rol'),
    pin: z
      .string()
      .regex(/^\d{4,6}$/, 'El PIN debe ser numérico de 4 a 6 dígitos'),
    email: z
      .string()
      .email('Formato de correo electrónico inválido')
      .or(z.literal('')),
    password: z.string(),
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
