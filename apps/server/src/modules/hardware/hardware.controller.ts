import { FastifyRequest, FastifyReply } from 'fastify';
import { printerRepository } from './repositories/printer.repository.js';
import { printerDriverService } from './services/printer-driver.service.js';
import { ManagePrinterUseCase } from './use-cases/manage-printer.use-case.js';
import { PrintKitchenTicketUseCase } from './use-cases/print-kitchen-ticket.use-case.js';
import { PrintReceiptUseCase } from './use-cases/print-receipt.use-case.js';
import { PrintPreCheckUseCase } from './use-cases/print-precheck.use-case.js';
import { PrintShiftSummaryUseCase } from './use-cases/print-shift-summary.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';

export class HardwareController {
  private readonly manageUseCase = new ManagePrinterUseCase(printerRepository, printerDriverService);
  private readonly kitchenUseCase = new PrintKitchenTicketUseCase(printerRepository, printerDriverService);
  private readonly receiptUseCase = new PrintReceiptUseCase(printerRepository, printerDriverService);
  private readonly precheckUseCase = new PrintPreCheckUseCase(printerRepository, printerDriverService);
  private readonly shiftSummaryUseCase = new PrintShiftSummaryUseCase(printerRepository, printerDriverService);

  async getHardwareStatus(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      status: 'ready',
      supportedPrinters: ['network_tcp', 'usb_raw', 'virtual'],
      timestamp: new Date().toISOString(),
    });
  }

  async getPrinters(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.query as { venueId?: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const printers = await this.manageUseCase.getPrinters(targetVenueId);
    return reply.send(printers);
  }

  async getPrinterById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const printer = await this.manageUseCase.getPrinterById(id);
    return reply.send(printer);
  }

  async createPrinter(request: FastifyRequest, reply: FastifyReply) {
    const printer = await this.manageUseCase.createPrinter(request.body);
    return reply.status(201).send(printer);
  }

  async updatePrinter(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const printer = await this.manageUseCase.updatePrinter(id, request.body);
    return reply.send(printer);
  }

  async deletePrinter(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.manageUseCase.deletePrinter(id);
    return reply.status(204).send();
  }

  async testPrinter(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { printerId: string; ipAddress?: string; port?: number };
    const result = await this.manageUseCase.testPrinter(body.printerId, body.ipAddress, body.port);
    return reply.send(result);
  }

  async printKitchenTicket(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { orderId: string; specificStation?: string; isAppend?: boolean };
    const result = await this.kitchenUseCase.execute(body.orderId, { specificStation: body.specificStation, isAppend: body.isAppend });
    return reply.send(result);
  }

  async printCustomerReceipt(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { receiptId: string };
    const result = await this.receiptUseCase.execute(body.receiptId);
    return reply.send(result);
  }

  async printPreCheck(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { orderId: string };
    const result = await this.precheckUseCase.execute(body.orderId);
    return reply.send(result);
  }

  async printShiftSummary(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { shiftId: string };
    const result = await this.shiftSummaryUseCase.execute(body.shiftId);
    return reply.send(result);
  }

  async openDrawer(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { printerId?: string };
    const result = await this.manageUseCase.openDrawer(body?.printerId);
    return reply.send(result);
  }
}

export const hardwareController = new HardwareController();
