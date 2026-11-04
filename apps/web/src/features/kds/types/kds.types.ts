export interface KdsItemStation {
  id: string;
  orderItemId: string;
  stationId: string;
  status: 'pending' | 'in_preparation' | 'ready' | 'delivered';
  sentAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  station?: {
    id: string;
    name: string;
    code: string;
    color?: string;
    icon?: string;
  };
}

export interface KdsItem {
  id: string;
  quantity: number;
  notes?: string | null;
  status: 'pending' | 'sent' | 'in_preparation' | 'ready' | 'delivered';
  course: number;
  sentAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  wasModifiedHot?: boolean;
  product?: {
    name: string;
    station?: string;
    printerStation?: string;
  };
  stations?: KdsItemStation[];
  modifiers?: Array<{
    modifierId: string;
  }>;
}

export interface KdsOrder {
  id: string;
  orderNumber?: number | string;
  guestName?: string | null;
  openedAt: string;
  closedAt?: string | null;
  paymentStatus?: 'unpaid' | 'partially_paid' | 'paid' | string;
  kitchenStatus?: string;
  table?: {
    label: string;
  } | null;
  waiter?: {
    name: string;
  } | null;
  items: KdsItem[];
}

export type StationFilter = 'all' | 'history' | string;

export interface UrgencyStyles {
  badge: string;
  cardBorder: string;
  elapsedMinutes: number;
  label: string;
}

export interface KdsViewProps {
  venueId: string;
}
