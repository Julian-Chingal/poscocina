import { FastifyRequest, FastifyReply } from 'fastify';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { receiptRepository } from './repositories/receipt.repository.js';
import { cashShiftRepository } from './repositories/cash-shift.repository.js';
import { ManageShiftUseCase } from './use-cases/manage-shift.use-case.js';
import { IssueReceiptUseCase } from './use-cases/issue-receipt.use-case.js';
import { SplitEqualUseCase } from './use-cases/split-equal.use-case.js';
import { SplitItemsUseCase } from './use-cases/split-items.use-case.js';
import { IssueReceiptDTO, SplitEqualDTO, SplitItemsDTO, OpenShiftDTO, CloseShiftDTO } from './types/billing.types.js';

export class BillingController {
  private readonly shiftUseCase = new ManageShiftUseCase(cashShiftRepository);
  private readonly issueReceiptUseCase = new IssueReceiptUseCase(receiptRepository, cashShiftRepository);
  private readonly splitEqualUseCase = new SplitEqualUseCase(receiptRepository, cashShiftRepository);
  private readonly splitItemsUseCase = new SplitItemsUseCase(receiptRepository, cashShiftRepository);

  async getPendingBills(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const pendingOrders = await receiptRepository.findPendingBills(targetVenueId);
    return reply.send(pendingOrders);
  }

  async getCurrentCashShift(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const shiftData = await this.shiftUseCase.getCurrentShift(targetVenueId);
    return reply.send(shiftData);
  }

  async openCashShift(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as OpenShiftDTO;
    const targetVenueId = await resolveVenueId(request, body.venueId);
    const newShift = await this.shiftUseCase.openShift(targetVenueId, body.openingAmount || 0, body.cashierId, body.notes);

    request.server.io?.emit('cash_shift:opened', newShift);
    return reply.status(201).send(newShift);
  }

  async closeCashShift(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { closingAmount, notes } = request.body as CloseShiftDTO;
    const result = await this.shiftUseCase.closeShift(id, closingAmount, notes);

    request.server.io?.emit('cash_shift:closed', result.shift);
    return reply.send(result);
  }

  async issueReceipt(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.issueReceiptUseCase.execute(request.body as IssueReceiptDTO);

    request.server.io?.emit('receipt:issued', result.receipt);
    request.server.io?.emit('order:status_updated', {
      id: result.orderId,
      paymentStatus: 'paid',
    });

    if (result.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: result.tableId,
        status: result.tableStatus,
        currentOrderId: result.isTableFreed ? null : result.orderId,
      });
    }
    for (const inv of result.updatedInventory) {
      request.server.io?.emit('inventory:stock_updated', inv);
    }

    return reply.status(201).send(result);
  }

  async splitBillingEqual(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.splitEqualUseCase.execute(request.body as SplitEqualDTO);

    request.server.io?.emit('receipt:issued', result.receipt);
    request.server.io?.emit('order:status_updated', {
      id: result.orderId,
      paymentStatus: result.isCompleted ? 'paid' : 'partially_paid',
    });

    if (result.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: result.tableId,
        status: result.tableStatus,
        currentOrderId: result.isTableFreed ? null : result.orderId,
      });
    }
    for (const inv of result.updatedInventory) {
      request.server.io?.emit('inventory:stock_updated', inv);
    }

    return reply.status(201).send(result);
  }

  async splitBillingByItems(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as SplitItemsDTO;
    const result = await this.splitItemsUseCase.execute(body);

    request.server.io?.emit('receipt:issued', result.receipt);
    request.server.io?.emit('order:status_updated', {
      id: result.orderId,
      paymentStatus: result.isCompleted ? 'paid' : 'partially_paid',
    });

    if (result.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: result.tableId,
        status: result.tableStatus,
        currentOrderId: result.isTableFreed ? null : result.orderId,
      });
    } else {
      request.server.io?.emit('order:items_updated', { orderId: body.orderId });
    }
    for (const inv of result.updatedInventory) {
      request.server.io?.emit('inventory:stock_updated', inv);
    }

    return reply.status(201).send(result);
  }
}

export const billingController = new BillingController();
