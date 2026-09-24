export interface KdsItem {
  id: string;
  quantity: number;
  notes?: string | null;
  status: 'pending' | 'sent' | 'in_preparation' | 'ready' | 'delivered';
  course: number;
  product?: {
    name: string;
    station?: 'kitchen' | 'bar' | 'dessert';
  };
  modifiers?: Array<{
    modifierId: string;
  }>;
}

export interface KdsOrder {
  id: string;
  orderNumber?: number | string;
  openedAt: string;
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

export type StationFilter = 'all' | 'kitchen' | 'bar' | 'dessert';

export interface UrgencyStyles {
  badge: string;
  cardBorder: string;
  elapsedMinutes: number;
  label: string;
}

export interface KdsViewProps {
  venueId: string;
}
