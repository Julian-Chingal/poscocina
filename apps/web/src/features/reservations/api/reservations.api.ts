import { api } from '@/services/api';
import {
  Reservation,
  TableItem,
  Customer,
  CreateReservationPayload,
  ReservationQueryParams,
  ReservationMetrics,
  ReservationStatus,
} from '../types/reservations.types';

export const reservationsApi = {
  getReservations: (venueId: string, filters?: ReservationQueryParams): Promise<Reservation[]> => {
    const params = new URLSearchParams({ venueId });
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.date) {
      params.append('date', filters.date);
    }
    if (filters?.timeframe && filters.timeframe !== 'all') {
      params.append('timeframe', filters.timeframe);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    return api.get(`/reservations?${params.toString()}`);
  },

  getMetrics: (venueId: string, timeframe?: string, date?: string): Promise<ReservationMetrics> => {
    const params = new URLSearchParams({ venueId });
    if (timeframe && timeframe !== 'all') params.append('timeframe', timeframe);
    if (date) params.append('date', date);
    return api.get(`/reservations/metrics?${params.toString()}`);
  },

  getTables: (venueId: string): Promise<TableItem[]> =>
    api.get(`/venues/${venueId}/tables`),

  searchCustomers: (venueId: string, query: string): Promise<Customer[]> =>
    api.get(`/customers/search?venueId=${venueId}&query=${encodeURIComponent(query)}`),

  createReservation: (payload: CreateReservationPayload): Promise<Reservation> =>
    api.post('/reservations', payload),

  updateStatus: (
    reservationId: string,
    status: ReservationStatus
  ): Promise<void> =>
    api.patch(`/reservations/${reservationId}/status`, { status }),

  seatReservation: (reservationId: string, waiterId?: string): Promise<void> =>
    api.post(`/reservations/${reservationId}/seat`, { waiterId }),
};
