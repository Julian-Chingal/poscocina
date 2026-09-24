export interface CreateOrderItemInput {
  productId: string;
  quantity?: number;
  unitPrice?: number;  // Optional — backend resolves from products table
  notes?: string;
  seatNumber?: number;
  course?: number;
  modifiers?: Array<{ modifierId: string; priceDelta?: number }>;
}

export interface CreateOrderPayload {
  venueId: string;
  tableId?: string | null;
  customerId?: string | null;
  orderType?: 'dine_in' | 'takeout' | 'delivery';
  waiterId?: string | null;
  guestCount?: number;
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface IOrderRepository {
  findActiveShift(venueId: string, tx?: any): Promise<any>;
  findOrderById(orderId: string, tx?: any): Promise<any>;
  findKdsOrders(venueId: string, station?: string): Promise<any[]>;
  createOrder(data: any, tx?: any): Promise<any>;
  insertOrderItems(items: any[], tx?: any): Promise<any[]>;
  insertItemModifiers(modifiers: any[], tx?: any): Promise<void>;
  updateTableOccupied(tableId: string, orderId: string, tx?: any): Promise<void>;
  updateOrderStatus(orderId: string, status: any): Promise<any>;
  updateOrderItemStatus(itemId: string, status: any): Promise<any>;
  updateOrderTotals(orderId: string, subtotal: string, taxTotal: string, total: string, extra?: Record<string, any>, tx?: any): Promise<any>;
  findOrderItemById(itemId: string, tx?: any): Promise<any>;
  findOrderItemsByOrderId(orderId: string, tx?: any): Promise<any[]>;
  updateOrderKitchenStatus(orderId: string, kitchenStatus: string, extra?: Record<string, any>, tx?: any): Promise<any>;
  freeTable(tableId: string, tx?: any): Promise<void>;
  setTableStatus(tableId: string, status: any, tx?: any): Promise<void>;
}
