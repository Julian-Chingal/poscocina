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

export interface Modifier {
  id: string;
  groupId: string;
  name: string;
  priceDelta: string | number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  venueId: string;
  name: string;
  selectionType: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number | null;
  sortOrder: number;
  modifiers: Modifier[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  modifierGroups?: ModifierGroup[];
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

export interface PosOrderItem {
  id?: string;
  productId: string;
  quantity: number;
  notes?: string;
  modifiers?: Array<{ modifierId: string; priceDelta: number }>;
}

export interface PosOrder {
  id: string;
  orderNumber?: string;
  tableId?: string;
  venueId?: string;
  status?: string;
  paymentStatus?: 'unpaid' | 'partially_paid' | 'paid' | string;
  kitchenStatus?: string;
  subtotal?: string | number;
  taxTotal?: string | number;
  total?: string | number;
  items?: PosOrderItem[];
}
