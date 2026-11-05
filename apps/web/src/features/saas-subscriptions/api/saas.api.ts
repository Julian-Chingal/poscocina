import { api } from '@/services/api';
import type {
  SaasPlan,
  SaasCoupon,
  SubscriptionDetail,
  SaasInvoice,
  AssignSubscriptionPayload,
  CreateCouponPayload,
  CreatePlanPayload,
  RecordManualPaymentPayload,
} from '../types/saas.types';

export const saasApi = {
  // Plans
  getPlans: (activeOnly = false): Promise<SaasPlan[]> =>
    api.get('/saas/plans', { params: { activeOnly: activeOnly ? 'true' : undefined } }),

  createPlan: (payload: CreatePlanPayload): Promise<SaasPlan> =>
    api.post('/saas/plans', payload),

  updatePlan: (id: string, payload: Partial<CreatePlanPayload>): Promise<SaasPlan> =>
    api.put(`/saas/plans/${id}`, payload),

  deletePlan: (id: string): Promise<{ message: string; id: string }> =>
    api.delete(`/saas/plans/${id}`),

  // Coupons
  getCoupons: (): Promise<SaasCoupon[]> =>
    api.get('/saas/coupons'),

  createCoupon: (payload: CreateCouponPayload): Promise<SaasCoupon> =>
    api.post('/saas/coupons', payload),

  updateCoupon: (id: string, payload: Partial<CreateCouponPayload>): Promise<SaasCoupon> =>
    api.put(`/saas/coupons/${id}`, payload),

  validateCoupon: (code: string, planId?: string, companyId?: string): Promise<{ valid: boolean; coupon: SaasCoupon }> =>
    api.post('/saas/coupons/validate', { code, planId, companyId }),

  // Subscriptions
  getAllSubscriptions: (): Promise<Array<{ subscription: any; company: any; plan: any; coupon: any }>> =>
    api.get('/saas/subscriptions'),

  getCompanySubscription: (companyId: string): Promise<SubscriptionDetail> =>
    api.get(`/saas/companies/${companyId}/subscription`),

  assignSubscription: (payload: AssignSubscriptionPayload): Promise<any> =>
    api.post('/saas/subscriptions/assign', payload),

  recordManualPayment: (payload: RecordManualPaymentPayload): Promise<SaasInvoice> =>
    api.post('/saas/subscriptions/manual-payment', payload),

  getCompanyInvoices: (companyId: string): Promise<SaasInvoice[]> =>
    api.get(`/saas/companies/${companyId}/invoices`),
};
