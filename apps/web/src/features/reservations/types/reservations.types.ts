export interface Customer {
  id: string;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
}

export interface TableItem {
  id: string;
  label: string;
  capacity: number;
  status: string;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'cancelled'
  | 'no_show';

export interface Reservation {
  id: string;
  venueId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId?: string;
  reservationTime: string;
  guestCount: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  table?: TableItem;
  customer?: Customer;
}

export interface CreateReservationPayload {
  venueId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerId?: string;
  tableId?: string;
  reservationTime: string;
  guestCount: number;
  notes?: string;
}

export type ReservationFilterStatus =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'history'
  | 'cancelled'
  | 'no_show';

export type ReservationTimeframe = 'all' | 'today' | 'tomorrow' | 'week' | 'upcoming';

export interface ReservationMetrics {
  pendingCount: number;
  confirmedCount: number;
  seatedCount: number;
  cancelledCount: number;
  noShowCount: number;
  totalActive: number;
  totalGuests: number;
}

export interface ReservationQueryParams {
  status?: ReservationFilterStatus;
  date?: string;
  timeframe?: ReservationTimeframe;
  search?: string;
}

export interface ReservationsViewProps {
  venueId: string;
  onNavigateToTable?: (table: TableItem) => void;
}
