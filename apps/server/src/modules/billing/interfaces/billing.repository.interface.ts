export interface CashShiftRecord {
  id: string;
  venueId: string;
  cashierId: string;
  openingAmount: string;
  closingAmount: string | null;
  expectedAmount: string | null;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt: Date | null;
  notes: string | null;
  openedByName?: string | null;
}

export interface SalesByMethodAggregate {
  method: string;
  total: string | null;
  tips: string | null;
}

export interface ICashShiftRepository {
  findActiveShiftByVenue(venueId: string, tx?: any): Promise<CashShiftRecord | null>;
  findShiftById(shiftId: string, tx?: any): Promise<CashShiftRecord | null>;
  getSalesByMethod(shiftId: string, tx?: any): Promise<SalesByMethodAggregate[]>;
  getShiftAggregates(shiftId: string, tx?: any): Promise<{ totalSales: string; cashSales: string; totalTips: string }>;
  createShift(data: { venueId: string; cashierId: string; openingAmount: string; notes?: string }, tx?: any): Promise<CashShiftRecord>;
  closeShift(shiftId: string, data: { closingAmount: string; expectedAmount: string; notes: string }, tx?: any): Promise<CashShiftRecord>;
}

export interface IReceiptRepository {
  findOrderWithVenue(orderId: string, tx?: any): Promise<{ order: any; venueSettings: any } | null>;
  findPendingBills(venueId: string): Promise<any[]>;
  createReceipt(data: any, tx?: any): Promise<any>;
  createPayments(receiptId: string, payments: any[], tx?: any): Promise<void>;
  deductInventoryForItems(orderId: string, items: any[], tx: any): Promise<any[]>;
  markOrderPaid(orderId: string, data: any, tx: any): Promise<void>;
  freeTable(tableId: string, tx: any): Promise<void>;
}
