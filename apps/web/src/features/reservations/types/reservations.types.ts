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
  | 'cancelled';

export interface ReservationsViewProps {
  venueId: string;
  onNavigateToTable?: (table: TableItem) => void;
}
