import { FastifyRequest, FastifyReply } from 'fastify';
import { hardwareService } from '../services/hardware.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { BadRequestError } from '../errors/app-error.js';

export class HardwareController {
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

  async printKitchenTicket(request: FastifyRequest, reply: FastifyReply) {
    const { orderId } = request.body as { orderId: string };
    if (!orderId) {
      throw new BadRequestError('orderId es requerido para imprimir comanda');
    }

    const result = await hardwareService.printKitchenTicket(orderId);
    return reply.send(result);
  }

  async printCustomerReceipt(request: FastifyRequest, reply: FastifyReply) {
    const { receiptId } = request.body as { receiptId: string };
    if (!receiptId) {
      throw new BadRequestError('receiptId es requerido para imprimir factura');
    }

    const result = await hardwareService.printCustomerReceipt(receiptId);
    return reply.send(result);
  }

  getHardwareStatus(_request: FastifyRequest, reply: FastifyReply) {
    const status = hardwareService.getHardwareStatus();
    return reply.send(status);
  }
}

export const hardwareController = new HardwareController();
