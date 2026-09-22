export interface PaymentInputDTO {
  method: 'cash' | 'card_credit' | 'card_debit' | 'transfer' | 'voucher' | 'other';
  amount: number;
  reference?: string;
  tipAmount?: number;
}

export interface IssueReceiptDTO {
  orderId: string;
  customerId?: string | null;
  payments: PaymentInputDTO[];
  isSplit?: boolean;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountReason?: string;
}

export interface SplitEqualDTO {
  orderId: string;
  customerId?: string | null;
  splitNumber: number;
  totalSplits: number;
  payments: PaymentInputDTO[];
}

export interface SplitItemsDTO {
  orderId: string;
  customerId?: string | null;
  itemIds: string[];
  payments: PaymentInputDTO[];
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountReason?: string;
}

export interface OpenShiftDTO {
  venueId?: string;
  openingAmount?: number;
  cashierId?: string;
  notes?: string;
}

export interface CloseShiftDTO {
  closingAmount: number;
  notes?: string;
}
