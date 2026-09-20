import { z } from 'zod';

export const CustomerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  documentType: z.string(),
  documentNumber: z.string(),
  phone: z.string(),
  email: z
    .string()
    .email('Formato de correo inválido')
    .or(z.literal('')),
  address: z.string(),
});

export type CustomerFormValues = z.infer<typeof CustomerSchema>;
