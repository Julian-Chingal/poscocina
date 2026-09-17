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

export interface BillItem {
  id: string;
  quantity: number;
  unitPrice: string;
  productName?: string;
  product?: { name: string };
  notes?: string;
}

export interface PendingBill {
  id: string;
  orderNumber?: number;
  table?: { id: string; label: string } | null;
  waiter?: { id: string; name: string } | null;
  status: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  openedAt: string;
  items?: BillItem[];
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
