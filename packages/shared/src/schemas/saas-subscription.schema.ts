import { z } from 'zod';

export const SubscriptionStatusEnum = z.enum([
  'trialing',
  'active',
  'past_due',
  'canceled',
  'complimentary',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusEnum>;

export const DiscountTypeEnum = z.enum(['percentage', 'fixed_amount']);
export type DiscountType = z.infer<typeof DiscountTypeEnum>;

export const CouponDurationEnum = z.enum(['once', 'repeating', 'forever']);
export type CouponDuration = z.infer<typeof CouponDurationEnum>;

export const BillingIntervalEnum = z.enum(['month', 'year']);
export type BillingInterval = z.infer<typeof BillingIntervalEnum>;

export const InvoiceStatusEnum = z.enum([
  'draft',
  'open',
  'paid',
  'void',
  'free_waiver',
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const PlanFeaturesSchema = z.object({
  kds: z.boolean().default(true),
  inventory: z.boolean().default(true),
  delivery: z.boolean().default(true),
  reservations: z.boolean().default(true),
  advancedReports: z.boolean().default(false),
  multiStation: z.boolean().default(true),
  customBranding: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
}).passthrough();
export type PlanFeatures = z.infer<typeof PlanFeaturesSchema>;

export const PlanLimitsSchema = z.object({
  maxVenues: z.number().int().default(1),
  maxTables: z.number().int().default(20),
  maxUsers: z.number().int().default(5),
  maxProducts: z.number().int().default(-1), // -1 = Unlimited
  maxOrdersPerMonth: z.number().int().default(-1), // -1 = Unlimited
}).passthrough();
export type PlanLimits = z.infer<typeof PlanLimitsSchema>;

// Plans
export const CreateSaasPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must have at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric and dashes'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  currency: z.string().default('COP'),
  billingInterval: BillingIntervalEnum.default('month'),
  trialDays: z.number().int().min(0).default(14),
  features: PlanFeaturesSchema.default({}),
  limits: PlanLimitsSchema.default({}),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreateSaasPlanInput = z.infer<typeof CreateSaasPlanSchema>;

export const UpdateSaasPlanSchema = CreateSaasPlanSchema.partial();
export type UpdateSaasPlanInput = z.infer<typeof UpdateSaasPlanSchema>;

// Coupons
export const CreateSaasCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Coupon code must have at least 3 characters')
    .max(50)
    .transform((val) => val.trim().toUpperCase()),
  name: z.string().min(2, 'Name must have at least 2 characters'),
  discountType: DiscountTypeEnum.default('percentage'),
  discountValue: z.number().positive('Discount value must be positive'),
  currency: z.string().default('COP'),
  duration: CouponDurationEnum.default('once'),
  durationInMonths: z.number().int().positive().optional().nullable(),
  maxRedemptions: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  applicablePlanIds: z.array(z.string().uuid()).optional().nullable(),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Percentage discount cannot exceed 100%',
      path: ['discountValue'],
    });
  }
  if (data.duration === 'repeating' && !data.durationInMonths) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Repeating duration requires durationInMonths',
      path: ['durationInMonths'],
    });
  }
});
export type CreateSaasCouponInput = z.infer<typeof CreateSaasCouponSchema>;

export const UpdateSaasCouponSchema = z.object({
  name: z.string().min(2).optional(),
  discountType: DiscountTypeEnum.optional(),
  discountValue: z.number().positive().optional(),
  currency: z.string().optional(),
  duration: CouponDurationEnum.optional(),
  durationInMonths: z.number().int().positive().optional().nullable(),
  maxRedemptions: z.number().int().positive().optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  applicablePlanIds: z.array(z.string().uuid()).optional().nullable(),
  isActive: z.boolean().optional(),
});
export type UpdateSaasCouponInput = z.infer<typeof UpdateSaasCouponSchema>;

export const ValidateCouponSchema = z.object({
  code: z.string().transform((val) => val.trim().toUpperCase()),
  planId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
});
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;

// Subscriptions
export const AssignSubscriptionSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  planId: z.string().uuid('Invalid plan ID'),
  billingInterval: BillingIntervalEnum.default('month'),
  isComplimentary: z.boolean().default(false),
  complimentaryReason: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  customLimits: PlanLimitsSchema.partial().optional().nullable(),
  customFeatures: PlanFeaturesSchema.partial().optional().nullable(),
  trialDays: z.number().int().min(0).optional().nullable(),
});
export type AssignSubscriptionInput = z.infer<typeof AssignSubscriptionSchema>;

export const RecordManualPaymentSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().min(0),
  paymentReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paidAt: z.string().datetime().optional(),
});
export type RecordManualPaymentInput = z.infer<typeof RecordManualPaymentSchema>;
