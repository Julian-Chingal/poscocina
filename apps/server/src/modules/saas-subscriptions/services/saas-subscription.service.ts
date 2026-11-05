import { saasSubscriptionRepository, SaasSubscriptionRepository } from '../repositories/saas-subscription.repository.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';
import type {
  AssignSubscriptionInput,
  RecordManualPaymentInput,
  ValidateCouponInput,
} from '@poscocina/shared';

export class SaasSubscriptionService {
  constructor(private readonly repo: SaasSubscriptionRepository = saasSubscriptionRepository) {}

  async validateCoupon(input: ValidateCouponInput) {
    const coupon = await this.repo.getCouponByCode(input.code);
    if (!coupon) {
      throw new NotFoundError(`Cupón "${input.code}" no encontrado`);
    }

    if (!coupon.isActive) {
      throw new BadRequestError(`El cupón "${coupon.code}" está inactivo`);
    }

    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      throw new BadRequestError(`El cupón "${coupon.code}" aún no está vigente`);
    }

    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      throw new BadRequestError(`El cupón "${coupon.code}" ha expirado`);
    }

    if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
      throw new BadRequestError(`El cupón "${coupon.code}" ha alcanzado el límite máximo de usos`);
    }

    if (input.planId && coupon.applicablePlanIds && Array.isArray(coupon.applicablePlanIds)) {
      if (!coupon.applicablePlanIds.includes(input.planId)) {
        throw new BadRequestError(`El cupón "${coupon.code}" no aplica para el plan seleccionado`);
      }
    }

    return coupon;
  }

  async assignSubscription(input: AssignSubscriptionInput) {
    const plan = await this.repo.getPlanById(input.planId);
    if (!plan) {
      throw new NotFoundError('El plan seleccionado no existe');
    }

    const now = new Date();
    const billingInterval = input.billingInterval || plan.billingInterval || 'month';
    const periodEnd = new Date(now);
    if (billingInterval === 'year') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // --- CASE 1: COMPLIMENTARY (GRATIS TODO) ---
    if (input.isComplimentary) {
      // Default to unlimited limits (-1) for all quotas unless explicitly bounded
      const complimentaryLimits = {
        maxVenues: -1,
        maxTables: -1,
        maxUsers: -1,
        maxProducts: -1,
        maxOrdersPerMonth: -1,
        ...(plan.limits as Record<string, any> || {}),
        ...(input.customLimits || {}),
      };

      const complimentaryFeatures = {
        kds: true,
        inventory: true,
        delivery: true,
        reservations: true,
        advancedReports: true,
        multiStation: true,
        customBranding: true,
        apiAccess: true,
        ...(plan.features as Record<string, any> || {}),
        ...(input.customFeatures || {}),
      };

      const sub = await this.repo.upsertSubscription({
        companyId: input.companyId,
        planId: plan.id,
        status: 'complimentary',
        billingInterval,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialStart: null,
        trialEnd: null,
        activeCouponId: null,
        customLimits: complimentaryLimits,
        customFeatures: complimentaryFeatures,
        isComplimentary: true,
        complimentaryReason: input.complimentaryReason || 'Cortesía de plataforma (100% Bonificado)',
      });

      // Issue $0 Free-Waiver invoice for audit trail
      await this.repo.createInvoice({
        companyId: input.companyId,
        subscriptionId: sub.id,
        amountDue: 0,
        amountPaid: 0,
        discountAmount: Number(plan.price),
        currency: plan.currency,
        status: 'free_waiver',
        paymentProvider: 'complimentary',
        notes: `Cortesía total concedida: ${input.complimentaryReason || 'Sin costo'}`,
        paidAt: now,
      });

      return sub;
    }

    // --- CASE 2: REGULAR PAID OR TRIALING PLAN ---
    let activeCouponId: string | null = null;
    let discountAmount = 0;
    const basePrice = Number(plan.price);

    if (input.couponCode) {
      const coupon = await this.validateCoupon({
        code: input.couponCode,
        planId: plan.id,
        companyId: input.companyId,
      });

      activeCouponId = coupon.id;
      if (coupon.discountType === 'percentage') {
        discountAmount = (basePrice * Number(coupon.discountValue)) / 100;
      } else {
        discountAmount = Math.min(basePrice, Number(coupon.discountValue));
      }
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);
    const trialDays = input.trialDays !== undefined && input.trialDays !== null
      ? input.trialDays
      : plan.trialDays;

    const isTrial = trialDays > 0;
    const trialStart = isTrial ? now : null;
    const trialEnd = isTrial ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const status = isTrial ? 'trialing' : (finalPrice === 0 ? 'active' : 'active');

    const sub = await this.repo.upsertSubscription({
      companyId: input.companyId,
      planId: plan.id,
      status,
      billingInterval,
      currentPeriodStart: now,
      currentPeriodEnd: isTrial && trialEnd ? trialEnd : periodEnd,
      trialStart,
      trialEnd,
      activeCouponId,
      customLimits: input.customLimits || null,
      customFeatures: input.customFeatures || null,
      isComplimentary: false,
      complimentaryReason: null,
    });

    if (activeCouponId) {
      await this.repo.recordCouponRedemption(activeCouponId, input.companyId, sub.id);
    }

    // Create Initial Invoice
    await this.repo.createInvoice({
      companyId: input.companyId,
      subscriptionId: sub.id,
      amountDue: finalPrice,
      amountPaid: isTrial || finalPrice === 0 ? finalPrice : 0,
      discountAmount,
      currency: plan.currency,
      status: isTrial ? 'paid' : (finalPrice === 0 ? 'paid' : 'open'),
      paymentProvider: 'manual',
      notes: isTrial ? `Período de prueba (${trialDays} días)` : 'Facturación manual generada',
      paidAt: isTrial || finalPrice === 0 ? now : null,
    });

    return sub;
  }

  async recordManualPayment(input: RecordManualPaymentInput) {
    const sub = await this.repo.getSubscriptionById(input.subscriptionId);
    if (!sub) {
      throw new NotFoundError('Suscripción no encontrada');
    }

    const plan = await this.repo.getPlanById(sub.planId);
    const now = input.paidAt ? new Date(input.paidAt) : new Date();

    // Extend subscription currentPeriodEnd by 1 period from now or existing end
    const currentEnd = new Date(sub.currentPeriodEnd);
    const startDate = currentEnd > now ? currentEnd : now;
    const nextEnd = new Date(startDate);
    if (sub.billingInterval === 'year') {
      nextEnd.setFullYear(nextEnd.getFullYear() + 1);
    } else {
      nextEnd.setMonth(nextEnd.getMonth() + 1);
    }

    await this.repo.upsertSubscription({
      companyId: sub.companyId,
      planId: sub.planId,
      status: 'active',
      billingInterval: sub.billingInterval,
      currentPeriodStart: startDate,
      currentPeriodEnd: nextEnd,
      trialStart: sub.trialStart,
      trialEnd: sub.trialEnd,
      activeCouponId: sub.activeCouponId,
      customLimits: sub.customLimits as Record<string, any>,
      customFeatures: sub.customFeatures as Record<string, any>,
      isComplimentary: sub.isComplimentary,
      complimentaryReason: sub.complimentaryReason,
    });

    const invoice = await this.repo.createInvoice({
      companyId: sub.companyId,
      subscriptionId: sub.id,
      amountDue: input.amount,
      amountPaid: input.amount,
      discountAmount: 0,
      currency: plan?.currency || 'COP',
      status: 'paid',
      paymentProvider: 'manual',
      paymentReference: input.paymentReference || null,
      notes: input.notes || 'Pago manual registrado por SuperAdmin',
      paidAt: now,
    });

    return invoice;
  }

  async getCompanySubscription(companyId: string) {
    return this.repo.getSubscriptionByCompanyId(companyId);
  }

  async checkFeatureAccess(companyId: string, featureKey: string): Promise<boolean> {
    const subInfo = await this.repo.getSubscriptionByCompanyId(companyId);
    if (!subInfo) return false;

    const { subscription, plan } = subInfo;
    const validStatuses = ['active', 'complimentary', 'trialing'];
    if (!validStatuses.includes(subscription.status)) {
      return false;
    }

    // Complimentary always has full access unless explicitly denied in customFeatures
    if (subscription.isComplimentary) {
      const customFeatures = subscription.customFeatures as Record<string, boolean> | null;
      if (customFeatures && customFeatures[featureKey] !== undefined) {
        return customFeatures[featureKey];
      }
      return true;
    }

    const customFeatures = subscription.customFeatures as Record<string, boolean> | null;
    if (customFeatures && customFeatures[featureKey] !== undefined) {
      return customFeatures[featureKey];
    }

    const planFeatures = plan.features as Record<string, boolean> | null;
    return !!(planFeatures && planFeatures[featureKey]);
  }

  async checkQuota(
    companyId: string,
    quotaKey: string,
    currentUsage: number
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const subInfo = await this.repo.getSubscriptionByCompanyId(companyId);
    if (!subInfo) {
      return { allowed: false, limit: 0, current: currentUsage };
    }

    const { subscription, plan } = subInfo;
    const validStatuses = ['active', 'complimentary', 'trialing'];
    if (!validStatuses.includes(subscription.status)) {
      return { allowed: false, limit: 0, current: currentUsage };
    }

    let limit = -1;
    const customLimits = subscription.customLimits as Record<string, number> | null;
    if (customLimits && customLimits[quotaKey] !== undefined) {
      limit = customLimits[quotaKey];
    } else {
      const planLimits = plan.limits as Record<string, number> | null;
      if (planLimits && planLimits[quotaKey] !== undefined) {
        limit = planLimits[quotaKey];
      }
    }

    // -1 signifies unlimited quota
    if (limit === -1 || subscription.isComplimentary) {
      return { allowed: true, limit: -1, current: currentUsage };
    }

    return {
      allowed: currentUsage < limit,
      limit,
      current: currentUsage,
    };
  }
}

export const saasSubscriptionService = new SaasSubscriptionService();
