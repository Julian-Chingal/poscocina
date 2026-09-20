import { z } from 'zod';

export const CreateReservationSchema = z.object({
  customerName: z.string().trim().min(2, 'El nombre del cliente es obligatorio'),
  customerPhone: z.string(),
  customerEmail: z
    .string()
    .email('Formato de correo inválido')
    .or(z.literal('')),
  customerId: z.string().optional(),
  tableId: z.string(),
  formDate: z.string().min(1, 'La fecha es obligatoria'),
  formTime: z.string().min(1, 'La hora es obligatoria'),
  guestCount: z.number().min(1, 'Mínimo 1 comensal').max(50, 'Máximo 50 comensales'),
  notes: z.string(),
});

export type CreateReservationFormValues = z.infer<typeof CreateReservationSchema>;
