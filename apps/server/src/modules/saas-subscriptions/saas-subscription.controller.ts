import { FastifyRequest, FastifyReply } from 'fastify';
import { saasSubscriptionRepository } from './repositories/saas-subscription.repository.js';
import { saasSubscriptionService } from './services/saas-subscription.service.js';
import { validate } from '../../utils/validation.util.js';
import {
  CreateSaasPlanSchema,
  UpdateSaasPlanSchema,
  CreateSaasCouponSchema,
  UpdateSaasCouponSchema,
  ValidateCouponSchema,
  AssignSubscriptionSchema,
  RecordManualPaymentSchema,
} from '@poscocina/shared';
import { BadRequestError, NotFoundError } from '../../errors/app-error.js';

export class SaasSubscriptionController {
  constructor(
    private readonly repo = saasSubscriptionRepository,
    private readonly service = saasSubscriptionService
  ) {}

  // --- PLANS ---
  async listPlans(req: FastifyRequest, rep: FastifyReply) {
    const { activeOnly } = req.query as { activeOnly?: string };
    const plans = await this.repo.listPlans(activeOnly === 'true');
    return rep.send(plans);
  }

  async getPlan(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.params as { id: string };
    const plan = await this.repo.getPlanById(id);
    if (!plan) throw new NotFoundError('Plan no encontrado');
    return rep.send(plan);
  }

  async createPlan(req: FastifyRequest, rep: FastifyReply) {
    const data = validate(CreateSaasPlanSchema, req.body);
    const created = await this.repo.createPlan(data);
    req.server.io?.emit('saas:plan:created', created);
    return rep.status(201).send(created);
  }

  async updatePlan(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.params as { id: string };
    const data = validate(UpdateSaasPlanSchema, req.body);
    const updated = await this.repo.updatePlan(id, data);
    if (!updated) throw new NotFoundError('Plan no encontrado');
    req.server.io?.emit('saas:plan:updated', updated);
    return rep.send(updated);
  }

  async deletePlan(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.params as { id: string };
    const deleted = await this.repo.deletePlan(id);
    if (!deleted) throw new NotFoundError('Plan no encontrado');
    req.server.io?.emit('saas:plan:deleted', { id });
    return rep.send({ message: 'Plan eliminado correctamente', id });
  }

  // --- COUPONS ---
  async listCoupons(_req: FastifyRequest, rep: FastifyReply) {
    const coupons = await this.repo.listCoupons();
    return rep.send(coupons);
  }

  async createCoupon(req: FastifyRequest, rep: FastifyReply) {
    const data = validate(CreateSaasCouponSchema, req.body);
    const existing = await this.repo.getCouponByCode(data.code);
    if (existing) {
      throw new BadRequestError(`Ya existe un cupón con el código "${data.code}"`);
    }
    const created = await this.repo.createCoupon(data);
    req.server.io?.emit('saas:coupon:created', created);
    return rep.status(201).send(created);
  }

  async updateCoupon(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.params as { id: string };
    const data = validate(UpdateSaasCouponSchema, req.body);
    const updated = await this.repo.updateCoupon(id, data);
    if (!updated) throw new NotFoundError('Cupón no encontrado');
    req.server.io?.emit('saas:coupon:updated', updated);
    return rep.send(updated);
  }

  async validateCoupon(req: FastifyRequest, rep: FastifyReply) {
    const data = validate(ValidateCouponSchema, req.body);
    const coupon = await this.service.validateCoupon(data);
    return rep.send({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        currency: coupon.currency,
        duration: coupon.duration,
      },
    });
  }

  // --- SUBSCRIPTIONS ---
  async listAllSubscriptions(_req: FastifyRequest, rep: FastifyReply) {
    const subscriptions = await this.repo.listAllSubscriptions();
    return rep.send(subscriptions);
  }

  async getCompanySubscription(req: FastifyRequest, rep: FastifyReply) {
    const { companyId } = req.params as { companyId?: string };
    const targetCompanyId = companyId || req.user?.companyId;

    if (!targetCompanyId) {
      throw new BadRequestError('ID de empresa no proporcionado');
    }

    const sub = await this.service.getCompanySubscription(targetCompanyId);
    return rep.send(sub || { subscription: null, plan: null, coupon: null });
  }

  async assignSubscription(req: FastifyRequest, rep: FastifyReply) {
    const data = validate(AssignSubscriptionSchema, req.body);
    const subscription = await this.service.assignSubscription(data);
    req.server.io?.emit('saas:subscription:updated', {
      companyId: data.companyId,
      subscription,
    });
    return rep.send(subscription);
  }

  async recordManualPayment(req: FastifyRequest, rep: FastifyReply) {
    const data = validate(RecordManualPaymentSchema, req.body);
    const invoice = await this.service.recordManualPayment(data);
    req.server.io?.emit('saas:invoice:paid', invoice);
    return rep.status(201).send(invoice);
  }

  async listCompanyInvoices(req: FastifyRequest, rep: FastifyReply) {
    const { companyId } = req.params as { companyId?: string };
    const targetCompanyId = companyId || req.user?.companyId;

    if (!targetCompanyId) {
      throw new BadRequestError('ID de empresa no proporcionado');
    }

    const invoices = await this.repo.listInvoicesByCompany(targetCompanyId);
    return rep.send(invoices);
  }
}

export const saasSubscriptionController = new SaasSubscriptionController();
