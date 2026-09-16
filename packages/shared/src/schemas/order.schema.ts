import { z } from 'zod';
import { ORDER_TYPE } from '../constants/statuses.js';

export const CreateOrderItemModifierSchema = z.object({
  modifierId: z.string().uuid(),
  priceDelta: z.number().default(0),
});

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
  notes: z.string().max(255).optional(),
  seatNumber: z.number().int().positive().optional(),
  course: z.number().int().positive().default(1),
  modifiers: z.array(CreateOrderItemModifierSchema).optional().default([]),
});

export const CreateOrderSchema = z.object({
  venueId: z.string().uuid(),
  tableId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  orderType: z.enum([ORDER_TYPE.DINE_IN, ORDER_TYPE.TAKEOUT, ORDER_TYPE.DELIVERY]).default(ORDER_TYPE.DINE_IN),
  waiterId: z.string().uuid().optional().nullable(),
  guestCount: z.number().int().positive().default(1),
  notes: z.string().max(500).optional(),
  items: z.array(CreateOrderItemSchema).min(1, 'La orden debe contener al menos un producto'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof CreateOrderItemSchema>;

export const UpdateItemStatusSchema = z.object({
  status: z.enum(['pending', 'sent', 'in_preparation', 'ready', 'delivered', 'cancelled']),
});

export type UpdateItemStatusInput = z.infer<typeof UpdateItemStatusSchema>;

export const AppendOrderItemsSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1, 'Debe incluir al menos un producto para anexar a la comanda'),
});

export type AppendOrderItemsInput = z.infer<typeof AppendOrderItemsSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'open',
    'sent_to_kitchen',
    'partially_ready',
    'ready',
    'check_requested',
    'paid',
    'cancelled',
    'voided',
  ]),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

