import { z } from 'zod';

export const DocumentTypeEnum = z.enum(['CC', 'NIT', 'CE', 'PP', 'TI', 'OTHER']);

export const CreateCustomerSchema = z.object({
  venueId: z.string().uuid().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  documentType: DocumentTypeEnum.default('CC'),
  documentNumber: z.string().min(3, 'El documento debe tener al menos 3 dígitos'),
  phone: z.string().optional(),
  email: z.string().email('Correo electrónico no válido').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const CustomerSearchSchema = z.object({
  q: z.string().min(1, 'Ingrese un término de búsqueda'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type DocumentType = z.infer<typeof DocumentTypeEnum>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CustomerSearchInput = z.infer<typeof CustomerSearchSchema>;
