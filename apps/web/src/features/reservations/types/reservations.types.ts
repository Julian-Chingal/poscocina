export interface Customer {
  id: string;
  name: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
}

export interface FloorPlanLayout {
  canvasWidth?: number;
  canvasHeight?: number;
  gridSize?: number;
  walls?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    kind: string;
    label?: string;
  }>;
  fixtures?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    kind: string;
    label: string;
  }>;
}

export interface FloorPlanItem {
  id: string;
  name: string;
  layout?: FloorPlanLayout;
  isActive?: boolean;
}

export interface TableItem {
  id: string;
  label: string;
  capacity: number;
  status: string;
  floorPlanId?: string;
  positionX?: string | number;
  positionY?: string | number;
  width?: number;
  height?: number;
  shape?: 'rect' | 'circle' | 'square';
  currentOrderId?: string | null;
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
