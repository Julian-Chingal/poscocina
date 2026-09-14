import { FastifyInstance } from 'fastify';
import { hardwareController } from '../controllers/hardware.controller.js';

export async function hardwareRoutes(fastify: FastifyInstance) {
  // 1. Kick Cash Drawer (Audited event)
  fastify.post('/api/hardware/open-drawer', (request, reply) =>
    hardwareController.openDrawer(request, reply)
  );

  // 2. Print Kitchen Ticket (Comanda de Cocina)
  fastify.post('/api/hardware/print-kitchen', (request, reply) =>
    hardwareController.printKitchenTicket(request, reply)
  );

  // 3. Print Customer Receipt (Ticket Térmico de Venta)
  fastify.post('/api/hardware/print-receipt', (request, reply) =>
    hardwareController.printCustomerReceipt(request, reply)
  );

  // 4. Hardware Status
  fastify.get('/api/hardware/status', (request, reply) =>
    hardwareController.getHardwareStatus(request, reply)
  );
}
