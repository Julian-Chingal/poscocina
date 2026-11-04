import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  saasPlans,
  saasCoupons,
  saasSubscriptions,
  saasCouponRedemptions,
  saasInvoices,
  companies,
} from '../../../db/schema.js';
import type {
  CreateSaasPlanInput,
  UpdateSaasPlanInput,
  CreateSaasCouponInput,
  UpdateSaasCouponInput,
} from '@poscocina/shared';

export class SaasSubscriptionRepository {
  // --- PLANS ---
  async listPlans(onlyActive = false) {
    if (onlyActive) {
      return db
        .select()
        .from(saasPlans)
        .where(eq(saasPlans.isActive, true))
        .orderBy(saasPlans.sortOrder, saasPlans.name);
    }
    return db.select().from(saasPlans).orderBy(saasPlans.sortOrder, saasPlans.name);
  }

  async getPlanById(id: string) {
    const [plan] = await db.select().from(saasPlans).where(eq(saasPlans.id, id));
    return plan ?? null;
  }

  async getPlanBySlug(slug: string) {
    const [plan] = await db.select().from(saasPlans).where(eq(saasPlans.slug, slug));
    return plan ?? null;
  }

  async createPlan(data: CreateSaasPlanInput) {
    const [created] = await db
      .insert(saasPlans)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        price: data.price.toString(),
        currency: data.currency ?? 'COP',
        billingInterval: data.billingInterval ?? 'month',
        trialDays: data.trialDays ?? 14,
        features: data.features ?? {},
        limits: data.limits ?? {},
        isActive: data.isActive ?? true,
        isPublic: data.isPublic ?? true,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return created;
  }

  async updatePlan(id: string, data: UpdateSaasPlanInput) {
    const values: Record<string, any> = { updatedAt: new Date() };
    if (data.name !== undefined) values.name = data.name;
    if (data.slug !== undefined) values.slug = data.slug;
    if (data.description !== undefined) values.description = data.description;
    if (data.price !== undefined) values.price = data.price.toString();
    if (data.currency !== undefined) values.currency = data.currency;
    if (data.billingInterval !== undefined) values.billingInterval = data.billingInterval;
    if (data.trialDays !== undefined) values.trialDays = data.trialDays;
    if (data.features !== undefined) values.features = data.features;
    if (data.limits !== undefined) values.limits = data.limits;
    if (data.isActive !== undefined) values.isActive = data.isActive;
    if (data.isPublic !== undefined) values.isPublic = data.isPublic;
    if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;

    const [updated] = await db
      .update(saasPlans)
      .set(values)
      .where(eq(saasPlans.id, id))
      .returning();
    return updated ?? null;
  }

  async deletePlan(id: string) {
    const [deleted] = await db.delete(saasPlans).where(eq(saasPlans.id, id)).returning();
    return deleted ?? null;
  }

  // --- COUPONS ---
  async listCoupons() {
    return db.select().from(saasCoupons).orderBy(desc(saasCoupons.createdAt));
  }

  async getCouponById(id: string) {
    const [coupon] = await db.select().from(saasCoupons).where(eq(saasCoupons.id, id));
    return coupon ?? null;
  }

  async getCouponByCode(code: string) {
    const [coupon] = await db
      .select()
      .from(saasCoupons)
      .where(eq(saasCoupons.code, code.trim().toUpperCase()));
    return coupon ?? null;
  }

  async createCoupon(data: CreateSaasCouponInput) {
    const [created] = await db
      .insert(saasCoupons)
      .values({
        code: data.code.trim().toUpperCase(),
        name: data.name,
        discountType: data.discountType,
        discountValue: data.discountValue.toString(),
        currency: data.currency ?? 'COP',
        duration: data.duration ?? 'once',
        durationInMonths: data.durationInMonths ?? null,
        maxRedemptions: data.maxRedemptions ?? null,
        timesRedeemed: 0,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        applicablePlanIds: data.applicablePlanIds ?? null,
        isActive: data.isActive ?? true,
      })
      .returning();
    return created;
  }

  async updateCoupon(id: string, data: UpdateSaasCouponInput) {
    const values: Record<string, any> = { updatedAt: new Date() };
    if (data.name !== undefined) values.name = data.name;
    if (data.discountType !== undefined) values.discountType = data.discountType;
    if (data.discountValue !== undefined) values.discountValue = data.discountValue.toString();
    if (data.currency !== undefined) values.currency = data.currency;
    if (data.duration !== undefined) values.duration = data.duration;
    if (data.durationInMonths !== undefined) values.durationInMonths = data.durationInMonths;
    if (data.maxRedemptions !== undefined) values.maxRedemptions = data.maxRedemptions;
    if (data.validFrom !== undefined) values.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    if (data.validUntil !== undefined) values.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    if (data.applicablePlanIds !== undefined) values.applicablePlanIds = data.applicablePlanIds;
    if (data.isActive !== undefined) values.isActive = data.isActive;

    const [updated] = await db
      .update(saasCoupons)
      .set(values)
      .where(eq(saasCoupons.id, id))
      .returning();
    return updated ?? null;
  }

  async incrementCouponUsage(id: string) {
    const coupon = await this.getCouponById(id);
    if (!coupon) return null;
    const [updated] = await db
      .update(saasCoupons)
      .set({
        timesRedeemed: coupon.timesRedeemed + 1,
        updatedAt: new Date(),
      })
      .where(eq(saasCoupons.id, id))
      .returning();
    return updated ?? null;
  }

  // --- SUBSCRIPTIONS ---
  async listAllSubscriptions() {
    return db
      .select({
        subscription: saasSubscriptions,
        company: {
          id: companies.id,
          legalName: companies.legalName,
          tradeName: companies.tradeName,
          taxId: companies.taxId,
          slug: companies.slug,
          logoUrl: companies.logoUrl,
        },
        plan: saasPlans,
        coupon: saasCoupons,
      })
      .from(saasSubscriptions)
      .innerJoin(companies, eq(saasSubscriptions.companyId, companies.id))
      .innerJoin(saasPlans, eq(saasSubscriptions.planId, saasPlans.id))
      .leftJoin(saasCoupons, eq(saasSubscriptions.activeCouponId, saasCoupons.id))
      .orderBy(desc(saasSubscriptions.updatedAt));
  }

  async getSubscriptionByCompanyId(companyId: string) {
    const [row] = await db
      .select({
        subscription: saasSubscriptions,
        plan: saasPlans,
        coupon: saasCoupons,
      })
      .from(saasSubscriptions)
      .innerJoin(saasPlans, eq(saasSubscriptions.planId, saasPlans.id))
      .leftJoin(saasCoupons, eq(saasSubscriptions.activeCouponId, saasCoupons.id))
      .where(eq(saasSubscriptions.companyId, companyId));
    return row ?? null;
  }

  async getSubscriptionById(id: string) {
    const [sub] = await db.select().from(saasSubscriptions).where(eq(saasSubscriptions.id, id));
    return sub ?? null;
  }

  async upsertSubscription(data: {
    companyId: string;
    planId: string;
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'complimentary';
    billingInterval: 'month' | 'year';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    activeCouponId?: string | null;
    customLimits?: Record<string, any> | null;
    customFeatures?: Record<string, any> | null;
    isComplimentary: boolean;
    complimentaryReason?: string | null;
  }) {
    const existing = await db
      .select()
      .from(saasSubscriptions)
      .where(eq(saasSubscriptions.companyId, data.companyId));

    if (existing.length > 0) {
      const [updated] = await db
        .update(saasSubscriptions)
        .set({
          planId: data.planId,
          status: data.status,
          billingInterval: data.billingInterval,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          trialStart: data.trialStart ?? null,
          trialEnd: data.trialEnd ?? null,
          activeCouponId: data.activeCouponId ?? null,
          customLimits: data.customLimits ?? null,
          customFeatures: data.customFeatures ?? null,
          isComplimentary: data.isComplimentary,
          complimentaryReason: data.complimentaryReason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(saasSubscriptions.companyId, data.companyId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(saasSubscriptions)
      .values({
        companyId: data.companyId,
        planId: data.planId,
        status: data.status,
        billingInterval: data.billingInterval,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialStart: data.trialStart ?? null,
        trialEnd: data.trialEnd ?? null,
        activeCouponId: data.activeCouponId ?? null,
        customLimits: data.customLimits ?? null,
        customFeatures: data.customFeatures ?? null,
        isComplimentary: data.isComplimentary,
        complimentaryReason: data.complimentaryReason ?? null,
      })
      .returning();
    return created;
  }

  // --- REDEMPTIONS & INVOICES ---
  async recordCouponRedemption(couponId: string, companyId: string, subscriptionId: string) {
    const [redemption] = await db
      .insert(saasCouponRedemptions)
      .values({
        couponId,
        companyId,
        subscriptionId,
      })
      .returning();
    await this.incrementCouponUsage(couponId);
    return redemption;
  }

  async createInvoice(data: {
    companyId: string;
    subscriptionId: string;
    amountDue: number;
    amountPaid: number;
    discountAmount: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'void' | 'free_waiver';
    paymentProvider?: string;
    paymentReference?: string | null;
    notes?: string | null;
    paidAt?: Date | null;
  }) {
    const [invoice] = await db
      .insert(saasInvoices)
      .values({
        companyId: data.companyId,
        subscriptionId: data.subscriptionId,
        amountDue: data.amountDue.toString(),
        amountPaid: data.amountPaid.toString(),
        discountAmount: data.discountAmount.toString(),
        currency: data.currency,
        status: data.status,
        paymentProvider: data.paymentProvider ?? 'manual',
        paymentReference: data.paymentReference ?? null,
        notes: data.notes ?? null,
        paidAt: data.paidAt ?? null,
      })
      .returning();
    return invoice;
  }

  async listInvoicesByCompany(companyId: string) {
    return db
      .select()
      .from(saasInvoices)
      .where(eq(saasInvoices.companyId, companyId))
      .orderBy(desc(saasInvoices.createdAt));
  }

  async getInvoiceById(id: string) {
    const [invoice] = await db.select().from(saasInvoices).where(eq(saasInvoices.id, id));
    return invoice ?? null;
  }

  async updateInvoiceStatus(id: string, status: 'draft' | 'open' | 'paid' | 'void' | 'free_waiver', paidAt?: Date) {
    const [updated] = await db
      .update(saasInvoices)
      .set({
        status,
        paidAt: paidAt ?? (status === 'paid' ? new Date() : null),
      })
      .where(eq(saasInvoices.id, id))
      .returning();
    return updated ?? null;
  }
}

export const saasSubscriptionRepository = new SaasSubscriptionRepository();
