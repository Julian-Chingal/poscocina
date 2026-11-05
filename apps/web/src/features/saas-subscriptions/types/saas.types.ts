export interface SaasPlan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  currency: string;
  billingInterval: 'month' | 'year';
  trialDays: number;
  features: Record<string, boolean>;
  limits: {
    maxVenues?: number;
    maxTables?: number;
    maxUsers?: number;
    maxProducts?: number;
    maxOrdersPerMonth?: number;
    [key: string]: number | undefined;
  };
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
}

export interface SaasCoupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: string;
  currency: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number | null;
  maxRedemptions?: number | null;
  timesRedeemed: number;
  validFrom?: string | null;
  validUntil?: string | null;
  applicablePlanIds?: string[] | null;
  isActive: boolean;
  createdAt: string;
}

export interface SaasSubscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'complimentary';
  billingInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  activeCouponId?: string | null;
  customLimits?: Record<string, number> | null;
  customFeatures?: Record<string, boolean> | null;
  isComplimentary: boolean;
  complimentaryReason?: string | null;
  trialStart?: string | null;
  trialEnd?: string | null;
}

export interface SaasInvoice {
  id: string;
  companyId: string;
  subscriptionId: string;
  amountDue: string;
  amountPaid: string;
  discountAmount: string;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'free_waiver';
  paymentProvider: string;
  paymentReference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface SubscriptionDetail {
  subscription: SaasSubscription | null;
  plan: SaasPlan | null;
  coupon: SaasCoupon | null;
}

export interface AssignSubscriptionPayload {
  companyId: string;
  planId: string;
  billingInterval?: 'month' | 'year';
  isComplimentary?: boolean;
  complimentaryReason?: string;
  couponCode?: string;
  customLimits?: Record<string, number>;
  customFeatures?: Record<string, boolean>;
  trialDays?: number;
}

export interface CreateCouponPayload {
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  isActive?: boolean;
}

export interface CreatePlanPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  billingInterval?: 'month' | 'year';
  trialDays?: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface RecordManualPaymentPayload {
  subscriptionId: string;
  amount: number;
  paymentReference?: string;
  notes?: string;
}
