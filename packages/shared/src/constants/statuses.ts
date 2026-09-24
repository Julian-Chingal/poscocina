export const TABLE_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  CHECK_REQUESTED: 'check_requested',
  PAID_WAITING_FOOD: 'paid_waiting_food',
  RESERVED: 'reserved',
  BLOCKED: 'blocked',
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const KITCHEN_STATUS = {
  QUEUED: 'queued',
  IN_PREPARATION: 'in_preparation',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type KitchenStatus = (typeof KITCHEN_STATUS)[keyof typeof KITCHEN_STATUS];

export const ORDER_STATUS = {
  OPEN: 'open',
  SENT_TO_KITCHEN: 'sent_to_kitchen',
  PARTIALLY_READY: 'partially_ready',
  READY: 'ready',
  CHECK_REQUESTED: 'check_requested',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  VOIDED: 'voided',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ITEM_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  IN_PREPARATION: 'in_preparation',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type ItemStatus = (typeof ITEM_STATUS)[keyof typeof ITEM_STATUS];

export const ORDER_TYPE = {
  DINE_IN: 'dine_in',
  TAKEOUT: 'takeout',
  DELIVERY: 'delivery',
} as const;

export type OrderType = (typeof ORDER_TYPE)[keyof typeof ORDER_TYPE];

export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD_CREDIT: 'card_credit',
  CARD_DEBIT: 'card_debit',
  TRANSFER: 'transfer',
  VOUCHER: 'voucher',
  OTHER: 'other',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const CASH_SHIFT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type CashShiftStatus = (typeof CASH_SHIFT_STATUS)[keyof typeof CASH_SHIFT_STATUS];
