import { FastifyRequest, FastifyReply } from 'fastify';
import { hardwareService } from '../services/hardware.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { validate } from '../utils/validation.util.js';
import {
  CreatePrinterSchema,
  UpdatePrinterSchema,
  TestPrintSchema,
  PrintKitchenTicketSchema,
  PrintReceiptSchema,
  PrintPreCheckSchema,
  PrintShiftSummarySchema,
} from '@poscocina/shared';

export class HardwareController {
  // Printers CRUD
  async getPrinters(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.query as { venueId?: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const printers = await hardwareService.getPrinters(targetVenueId);
    return reply.send(printers);
  }

  async getPrinterById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const printer = await hardwareService.getPrinterById(id);
    return reply.send(printer);
  }

  async createPrinter(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(CreatePrinterSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const printer = await hardwareService.createPrinter({
      ...data,
      venueId: targetVenueId,
    });
    return reply.status(201).send(printer);
  }

  async updatePrinter(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdatePrinterSchema, request.body);

    const updated = await hardwareService.updatePrinter(id, data);
    return reply.send(updated);
  }

  async deletePrinter(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await hardwareService.deletePrinter(id);
    return reply.send(result);
  }

  // Diagnostics / Test Print
  async testPrinter(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(TestPrintSchema, request.body);
    const { venueId } = request.query as { venueId?: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const result = await hardwareService.testPrinter(targetVenueId, data);
    return reply.send(result);
  }

  // Kitchen Tickets
  async printKitchenTicket(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PrintKitchenTicketSchema, request.body);
    const { venueId } = request.query as { venueId?: string };
    const targetVenueId = await resolveVenueId(request, venueId);

    const result = await hardwareService.printKitchenTickets(targetVenueId, data.orderId, {
      specificStation: data.station,
      isAppend: data.isAppend,
    });

    return reply.send(result);
  }

  // Customer Receipt
  async printCustomerReceipt(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PrintReceiptSchema, request.body);

    const result = await hardwareService.printCustomerReceipt(data.receiptId, data.printerId);
    return reply.send(result);
  }

  // Pre-Check (Pre-Cuenta)
  async printPreCheck(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PrintPreCheckSchema, request.body);

    const result = await hardwareService.printPreCheck(data.orderId, data.printerId);
    return reply.send(result);
  }

  // Shift Summary (Z-Report)
  async printShiftSummary(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PrintShiftSummarySchema, request.body);

    const result = await hardwareService.printShiftSummary(data.shiftId, data.printerId);
    return reply.send(result);
  }

  // Drawer Kick
  async openDrawer(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = (request.body as { venueId?: string }) || {};
    const targetVenueId = await resolveVenueId(request, venueId);
    const user = request.user as { id?: string } | undefined;

    const result = await hardwareService.triggerDrawerKick(targetVenueId, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: user?.id,
    });

    request.server.io?.to(`venue:${targetVenueId}`).emit('hardware:drawer_opened', {
      timestamp: new Date().toISOString(),
      action: 'drawer_kick',
    });

    return reply.send(result);
  }

  getHardwareStatus(_request: FastifyRequest, reply: FastifyReply) {
    const status = hardwareService.getHardwareStatus();
    return reply.send(status);
  }
}

export const hardwareController = new HardwareController();
