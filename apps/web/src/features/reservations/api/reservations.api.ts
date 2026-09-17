import { api } from '@/services/api';
import {
  Reservation,
  TableItem,
  Customer,
  CreateReservationPayload,
} from '../types/reservations.types';

export const reservationsApi = {
  getReservations: (venueId: string, date?: string): Promise<Reservation[]> => {
    const url = date
      ? `/reservations?venueId=${venueId}&date=${date}`
      : `/reservations?venueId=${venueId}`;
    return api.get(url);
  },

  getTables: (venueId: string): Promise<TableItem[]> =>
    api.get(`/venues/${venueId}/tables`),

  searchCustomers: (venueId: string, query: string): Promise<Customer[]> =>
    api.get(`/customers/search?venueId=${venueId}&query=${encodeURIComponent(query)}`),

  createReservation: (payload: CreateReservationPayload): Promise<Reservation> =>
    api.post('/reservations', payload),

  updateStatus: (
    reservationId: string,
    status: 'confirmed' | 'cancelled' | 'no_show'
  ): Promise<void> =>
    api.patch(`/reservations/${reservationId}/status`, { status }),

  seatReservation: (reservationId: string, waiterId?: string): Promise<void> =>
    api.post(`/reservations/${reservationId}/seat`, { waiterId }),
};
