import { z } from 'zod';

export const DeliveryOrderItemModifierSchema = z.object({
  modifierId: z.string().uuid(),
  name: z.string(),
  priceDelta: z.number().default(0),
});

export const DeliveryOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
  notes: z.string().max(255).optional(),
  modifiers: z.array(DeliveryOrderItemModifierSchema).default([]),
});

export const CreateDeliveryOrderSchema = z.object({
  venueId: z.string().uuid('ID de restaurante inválido'),
  customer: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    phone: z.string().min(7, 'El teléfono es obligatorio para coordinar la entrega'),
    address: z.string().min(5, 'La dirección de entrega es obligatoria'),
    email: z.string().email().optional().or(z.literal('')),
    notes: z.string().max(300).optional(),
  }),
  items: z.array(DeliveryOrderItemSchema).min(1, 'El pedido debe tener al menos un producto'),
  paymentMethod: z.enum(['cash', 'transfer', 'card_on_delivery']).default('cash'),
  cashPaymentAmount: z.number().optional(),
  deliveryNotes: z.string().max(300).optional(),
});

export type DeliveryOrderItemModifier = z.infer<typeof DeliveryOrderItemModifierSchema>;
export type DeliveryOrderItem = z.infer<typeof DeliveryOrderItemSchema>;
export type CreateDeliveryOrderInput = z.infer<typeof CreateDeliveryOrderSchema>;
