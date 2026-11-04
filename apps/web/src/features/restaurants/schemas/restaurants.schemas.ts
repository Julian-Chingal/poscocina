import { z } from 'zod';

export const CreateRestaurantSchema = z.object({
  tradeName: z.string().trim().min(2, 'El nombre comercial debe tener al menos 2 caracteres'),
  legalName: z.string().trim().min(2, 'La razón social debe tener al menos 2 caracteres'),
  taxId: z.string().trim().min(3, 'El NIT/RUT debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'El identificador solo permite minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Color hexadecimal inválido'),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Formato de correo inválido').optional().or(z.literal('')),
  address: z.string().trim().optional().or(z.literal('')),
  initialVenueName: z.string().trim().min(2, 'El nombre de la sede debe tener al menos 2 caracteres'),
  initialVenueAddress: z.string().trim().optional().or(z.literal('')),
});

export type CreateRestaurantFormValues = z.infer<typeof CreateRestaurantSchema>;
