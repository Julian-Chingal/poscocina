import { FastifyRequest, FastifyReply } from 'fastify';
import { billingService, PaymentInput } from '../services/billing.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { BadRequestError } from '../errors/app-error.js';

export class BillingController {
  async getCurrentCashShift(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const shiftData = await billingService.getCurrentCashShift(targetVenueId);
    return reply.send(shiftData);
  }

  async openCashShift(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      venueId?: string;
      cashierId?: string;
      openingAmount?: number;
      notes?: string;
    };

    const targetVenueId = await resolveVenueId(request, body.venueId);
    const newShift = await billingService.openCashShift(
      targetVenueId,
      body.openingAmount || 0,
      body.cashierId,
      body.notes
    );

    request.server.io?.emit('cash_shift:opened', newShift);
    return reply.status(201).send(newShift);
  }

  async closeCashShift(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { closingAmount, notes } = request.body as {
      closingAmount: number;
      notes?: string;
    };

    if (closingAmount === undefined || closingAmount === null) {
      throw new BadRequestError('El monto final de arqueo (closingAmount) es obligatorio.');
    }

    const result = await billingService.closeCashShift(id, closingAmount, notes);

    request.server.io?.emit('cash_shift:closed', result.shift);
    return reply.send(result);
  }

  async issueReceipt(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      orderId: string;
      payments: PaymentInput[];
      isSplit?: boolean;
    };

    if (!body?.orderId) {
      throw new BadRequestError('orderId es requerido para facturar.');
    }

    const result = await billingService.issueReceipt(body);

    request.server.io?.emit('receipt:issued', result.receipt);
    if (result.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: result.tableId,
        status: 'free',
        currentOrderId: null,
      });
    }
    for (const inv of result.updatedInventory) {
      request.server.io?.emit('inventory:stock_updated', inv);
    }

    return reply.status(201).send(result);
  }
}

export const billingController = new BillingController();
