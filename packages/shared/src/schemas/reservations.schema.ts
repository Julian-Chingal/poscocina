import { z } from 'zod';

export const ReservationStatusEnum = z.enum(['pending', 'confirmed', 'seated', 'cancelled', 'no_show']);

export const CreateReservationSchema = z.object({
  venueId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(2, 'El nombre del cliente es requerido'),
  customerPhone: z.string().min(5, 'El teléfono es requerido para reservas'),
  guestCount: z.number().int().min(1, 'Al menos 1 persona').max(50, 'Máximo 50 comensales por reserva'),
  reservationTime: z.string().datetime({ message: 'Fecha y hora no válida (formato ISO requerido)' }),
  notes: z.string().optional(),
});

export const UpdateReservationStatusSchema = z.object({
  status: ReservationStatusEnum,
  notes: z.string().optional(),
});

export const SeatReservationSchema = z.object({
  waiterId: z.string().uuid().optional().nullable(),
  tableId: z.string().uuid().optional().nullable(),
});

export type ReservationStatus = z.infer<typeof ReservationStatusEnum>;
export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;
export type UpdateReservationStatusInput = z.infer<typeof UpdateReservationStatusSchema>;
export type SeatReservationInput = z.infer<typeof SeatReservationSchema>;
