import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { hardwareController } from '../controllers/hardware.controller.js';

export async function hardwareRoutes(fastify: FastifyInstance) {
  // Public status / health
  fastify.get('/api/hardware/status', (request, reply) =>
    hardwareController.getHardwareStatus(request, reply)
  );

  // Authenticated Hardware Operations
  fastify.register(async (authGroup) => {
    authGroup.addHook('onRequest', fastify.authenticate);

    const managerOnly = { preHandler: [fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])] };
    const cashierOnly = { preHandler: [fastify.requireRole([ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN])] };

    // 1. Printers CRUD
    authGroup.get('/api/hardware/printers', (req, rep) =>
      hardwareController.getPrinters(req, rep)
    );
    authGroup.get('/api/hardware/printers/:id', (req, rep) =>
      hardwareController.getPrinterById(req, rep)
    );
    authGroup.post('/api/hardware/printers', managerOnly, (req, rep) =>
      hardwareController.createPrinter(req, rep)
    );
    authGroup.put('/api/hardware/printers/:id', managerOnly, (req, rep) =>
      hardwareController.updatePrinter(req, rep)
    );
    authGroup.delete('/api/hardware/printers/:id', managerOnly, (req, rep) =>
      hardwareController.deletePrinter(req, rep)
    );

    // 2. Hardware Diagnostics
    authGroup.post('/api/hardware/test-print', managerOnly, (req, rep) =>
      hardwareController.testPrinter(req, rep)
    );

    // 3. Kitchen Tickets (Multi-station routing)
    authGroup.post('/api/hardware/print-kitchen', (req, rep) =>
      hardwareController.printKitchenTicket(req, rep)
    );

    // 4. Customer Receipt (Factura Térmica de Venta)
    authGroup.post('/api/hardware/print-receipt', cashierOnly, (req, rep) =>
      hardwareController.printCustomerReceipt(req, rep)
    );

    // 5. Pre-Check (Pre-cuenta de Mesa)
    authGroup.post('/api/hardware/print-precheck', (req, rep) =>
      hardwareController.printPreCheck(req, rep)
    );

    // 6. Shift Summary (Ticket de Cierre Z-Report)
    authGroup.post('/api/hardware/print-shift-summary', cashierOnly, (req, rep) =>
      hardwareController.printShiftSummary(req, rep)
    );

    // 7. Cash Drawer Pulse
    authGroup.post('/api/hardware/open-drawer', cashierOnly, (req, rep) =>
      hardwareController.openDrawer(req, rep)
    );
  });
}
