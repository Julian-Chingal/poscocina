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
    neighborhood: z.string().optional(),
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

export const ConfirmTransferPaymentSchema = z.object({
  reference: z.string().max(100).optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().max(300).optional(),
});
export type ConfirmTransferPaymentInput = z.infer<typeof ConfirmTransferPaymentSchema>;

export const CompleteDeliverySchema = z.object({
  deliveryPin: z.string().regex(/^\d{4,6}$/, 'El código de entrega debe tener entre 4 y 6 dígitos'),
});
export type CompleteDeliveryInput = z.infer<typeof CompleteDeliverySchema>;

export const AssignDriverSchema = z.object({
  driverId: z.string().uuid('ID de domiciliario inválido'),
});
export type AssignDriverInput = z.infer<typeof AssignDriverSchema>;

export const RequestCustomerOtpSchema = z.object({
  venueId: z.string().uuid('ID de restaurante inválido'),
  phone: z.string().min(7, 'Número de teléfono inválido'),
  name: z.string().optional(),
});
export type RequestCustomerOtpInput = z.infer<typeof RequestCustomerOtpSchema>;

export const VerifyCustomerOtpSchema = z.object({
  venueId: z.string().uuid('ID de restaurante inválido'),
  phone: z.string().min(7, 'Número de teléfono inválido'),
  code: z.string().length(6, 'El código OTP debe ser de 6 dígitos'),
});
export type VerifyCustomerOtpInput = z.infer<typeof VerifyCustomerOtpSchema>;

// Independent Courier Marketplace Schemas
export const RegisterDriverSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().min(7, 'El teléfono de WhatsApp es obligatorio'),
  documentType: z.enum(['CC', 'CE', 'PASAPORTE', 'PPT']).default('CC'),
  documentNumber: z.string().min(5, 'Número de documento obligatorio'),
  city: z.string().min(2, 'Ciudad obligatoria').default('Popayán'),
  vehicleType: z.enum(['motorcycle', 'bicycle', 'car']).default('motorcycle'),
  licensePlate: z.string().max(20).optional(),
  payoutMethod: z.enum(['nequi', 'daviplata', 'bancolombia']).default('nequi'),
  payoutAccount: z.string().min(6, 'Cuenta o número de teléfono de cobro requerido'),
});
export type RegisterDriverInput = z.infer<typeof RegisterDriverSchema>;

export const ClaimDeliveryOrderSchema = z.object({
  orderId: z.string().uuid('ID de pedido inválido'),
});
export type ClaimDeliveryOrderInput = z.infer<typeof ClaimDeliveryOrderSchema>;

export const ConfirmPickupPinSchema = z.object({
  pickupPin: z.string().regex(/^\d{4,6}$/, 'El código de recogida del restaurante debe tener entre 4 y 6 dígitos'),
});
export type ConfirmPickupPinInput = z.infer<typeof ConfirmPickupPinSchema>;

export const UpdateDriverStatusSchema = z.object({
  status: z.enum(['offline', 'available', 'busy']),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
});
export type UpdateDriverStatusInput = z.infer<typeof UpdateDriverStatusSchema>;

export const DriverWalletPayoutRequestSchema = z.object({
  amount: z.number().positive('El monto a retirar debe ser mayor a 0'),
  payoutMethod: z.enum(['nequi', 'daviplata', 'bancolombia']).optional(),
  payoutAccount: z.string().optional(),
});
export type DriverWalletPayoutRequestInput = z.infer<typeof DriverWalletPayoutRequestSchema>;
