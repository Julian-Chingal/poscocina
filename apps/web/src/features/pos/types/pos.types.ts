export interface Customer {
  id: string;
  name: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  loyaltyPoints?: number;
  address?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
  modifiers: Array<{ modifierId: string; priceDelta: number }>;
}

export interface TableItem {
  id: string;
  label: string;
  status: string;
  currentOrderId?: string | null;
}

export interface PosViewProps {
  venueId: string;
  selectedTable?: TableItem | null;
}

export type SplitMode = 'single' | 'equal' | 'items';
export type PaymentMethod = 'cash' | 'card_credit' | 'transfer';
export type DiscountType = 'percent' | 'fixed';
