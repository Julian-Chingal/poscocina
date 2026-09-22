import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { hardwareController } from './hardware.controller.js';

export async function hardwareRoutes(fastify: FastifyInstance) {
  // Public status / health
  fastify.get('/api/hardware/status', (req, rep) => hardwareController.getHardwareStatus(req, rep));

  // Authenticated Operations
  fastify.register(async (authGroup) => {
    authGroup.addHook('onRequest', fastify.authenticate);

    const managerOnly = { preHandler: [fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])] };
    const cashierOnly = { preHandler: [fastify.requireRole([ROLES.CASHIER, ROLES.MANAGER, ROLES.SUPER_ADMIN])] };

    // Printers CRUD
    authGroup.get('/api/hardware/printers', (req, rep) => hardwareController.getPrinters(req, rep));
    authGroup.get('/api/hardware/printers/:id', (req, rep) => hardwareController.getPrinterById(req, rep));
    authGroup.post('/api/hardware/printers', managerOnly, (req, rep) => hardwareController.createPrinter(req, rep));
    authGroup.put('/api/hardware/printers/:id', managerOnly, (req, rep) => hardwareController.updatePrinter(req, rep));
    authGroup.delete('/api/hardware/printers/:id', managerOnly, (req, rep) => hardwareController.deletePrinter(req, rep));

    // Diagnostics & Printing Operations
    authGroup.post('/api/hardware/test-print', managerOnly, (req, rep) => hardwareController.testPrinter(req, rep));
    authGroup.post('/api/hardware/print-kitchen', (req, rep) => hardwareController.printKitchenTicket(req, rep));
    authGroup.post('/api/hardware/print-receipt', cashierOnly, (req, rep) => hardwareController.printCustomerReceipt(req, rep));
    authGroup.post('/api/hardware/print-precheck', (req, rep) => hardwareController.printPreCheck(req, rep));
    authGroup.post('/api/hardware/print-shift-summary', cashierOnly, (req, rep) => hardwareController.printShiftSummary(req, rep));
    authGroup.post('/api/hardware/open-drawer', cashierOnly, (req, rep) => hardwareController.openDrawer(req, rep));
  });
}
