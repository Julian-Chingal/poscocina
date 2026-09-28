export type PaymentMethod = 'cash' | 'card_credit' | 'transfer';

export interface ActiveShiftInfo {
  open: boolean;
  shift?: {
    id: string;
    openedAt: string;
    openingAmount: string;
    notes?: string;
  };
  salesByMethod?: Array<{
    method: string;
    total: string;
    tips: string;
  }>;
}

export interface BillItemModifier {
  id?: string;
  modifierId?: string;
  priceDelta?: string;
  modifier?: { id: string; name: string };
}

export interface BillItem {
  id: string;
  quantity: number;
  unitPrice: string;
  productName?: string;
  product?: { name: string };
  notes?: string;
  seatNumber?: number | null;
  course?: number | null;
  modifiers?: BillItemModifier[];
}

export interface BillReceipt {
  id: string;
  receiptNumber: number;
  total: string;
  subtotal: string;
  taxTotal: string;
  issuedAt?: string;
  payments?: Array<{ id?: string; method: string; amount: string | number }>;
}

export interface PendingBill {
  id: string;
  orderNumber?: number;
  guestName?: string | null;
  table?: { id: string; label: string } | null;
  waiter?: { id: string; name: string } | null;
  status: string;
  paymentStatus?: string;
  kitchenStatus?: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  totalPaid?: string;
  pendingBalance?: string;
  openedAt: string;
  items?: BillItem[];
  receipts?: BillReceipt[];
}

export interface CloseShiftReportData {
  expected?: number;
  actual?: number;
  difference?: number;
}

export interface ReceiptData {
  id: string;
  receiptNumber: number | string;
  issuedAt: string;
  total: string;
  metadata?: { tableLabel?: string };
  payments?: Array<{ method: string; amount: number }>;
}
