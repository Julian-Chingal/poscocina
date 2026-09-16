import { z } from 'zod';

export const PaymentItemSchema = z.object({
  method: z.enum(['cash', 'card_credit', 'card_debit', 'transfer', 'voucher', 'other']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  reference: z.string().optional(),
  tipAmount: z.number().min(0).default(0),
});

export const IssueReceiptSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  payments: z.array(PaymentItemSchema).min(1, 'Debe registrar al menos un método de pago'),
  isSplit: z.boolean().optional().default(false),
  discountType: z.enum(['percent', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  discountReason: z.string().optional(),
});

export const SplitEqualPaymentSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  splitNumber: z.number().int().min(1),
  totalSplits: z.number().int().min(2).max(20),
  payments: z.array(PaymentItemSchema).min(1),
});

export const SplitItemsPaymentSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  itemIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos un ítem'),
  payments: z.array(PaymentItemSchema).min(1),
  discountType: z.enum(['percent', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  discountReason: z.string().optional(),
});

export const RegisterWasteMovementSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.number().positive('La cantidad de merma debe ser positiva'),
  notes: z.string().min(3, 'El motivo de la merma es requerido'),
});

export type PaymentItem = z.infer<typeof PaymentItemSchema>;
export type IssueReceiptInput = z.infer<typeof IssueReceiptSchema>;
export type SplitEqualPaymentInput = z.infer<typeof SplitEqualPaymentSchema>;
export type SplitItemsPaymentInput = z.infer<typeof SplitItemsPaymentSchema>;
export type RegisterWasteMovementInput = z.infer<typeof RegisterWasteMovementSchema>;
