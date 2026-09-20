import { z } from 'zod';

export const PasswordLoginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type PasswordLoginFormValues = z.infer<typeof PasswordLoginSchema>;
