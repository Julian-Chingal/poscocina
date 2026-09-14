import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

// ESC/POS Command Constants
const ESC = '\x1B';
const GS = '\x1D';
const CMD = {
  INIT: `${ESC}@`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  DOUBLE_ON: `${GS}!\x11`, // 2x width and 2x height
  DOUBLE_OFF: `${GS}!\x00`,
  CUT: `${GS}V\x41\x03`, // Full cut with feed
  DRAWER_PULSE: `${ESC}p\x00\x19\xFA`, // Standard kick pulse pin 2 (25ms pulse)
};

import { auditService } from '../services/audit.service.js';

export async function hardwareRoutes(fastify: FastifyInstance) {
  // 1. Kick Cash Drawer (Audited event)
  fastify.post('/api/hardware/open-drawer', async (request, reply) => {
    const { venueId } = (request.body as { venueId?: string }) || {};

    // Audit drawer kick
    await auditService.log({
      venueId: venueId || null,
      action: 'DRAWER_KICK',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Emit real-time event to POS clients
    fastify.io?.to(`venue:${venueId || 'default'}`).emit('hardware:drawer_opened', {
      timestamp: new Date().toISOString(),
      action: 'drawer_kick',
    });

    return reply.send({
      success: true,
      message: 'Pulso de apertura de gaveta enviado (ESC/POS pin 2)',
      escposCommand: Buffer.from(CMD.DRAWER_PULSE, 'binary').toString('base64'),
    });
  });

  // 2. Print Kitchen Ticket (Comanda de Cocina)
  fastify.post('/api/hardware/print-kitchen', async (request, reply) => {
    const { orderId } = request.body as { orderId: string };

    if (!orderId) {
      return reply.status(400).send({ error: 'orderId es requerido' });
    }

    const [order] = await db
      .select({
        id: schema.orders.id,
        status: schema.orders.status,
        notes: schema.orders.notes,
        openedAt: schema.orders.openedAt,
        tableLabel: schema.tables.label,
        waiterName: schema.users.name,
      })
      .from(schema.orders)
      .leftJoin(schema.tables, eq(schema.orders.tableId, schema.tables.id))
      .leftJoin(schema.users, eq(schema.orders.waiterId, schema.users.id))
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return reply.status(404).send({ error: 'Orden no encontrada' });
    }

    const items = await db
      .select({
        id: schema.orderItems.id,
        quantity: schema.orderItems.quantity,
        notes: schema.orderItems.notes,
        productName: schema.products.name,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .where(eq(schema.orderItems.orderId, orderId));

    // Build Formatted ESC/POS Text & ASCII Ticket
    const divider = '------------------------------------------\n';
    let escpos = CMD.INIT;
    escpos += CMD.ALIGN_CENTER + CMD.DOUBLE_ON + '*** COCINA / BAR ***\n' + CMD.DOUBLE_OFF;
    escpos += CMD.ALIGN_LEFT;
    escpos += `MESA: ${order.tableLabel || 'BARRA / LLEVAR'}    MESERO: ${order.waiterName || 'General'}\n`;
    escpos += `HORA: ${new Date(order.openedAt).toLocaleTimeString('es-CO')}\n`;
    escpos += `ORDEN: #${order.id.slice(0, 8).toUpperCase()}\n`;
    escpos += divider;
    escpos += CMD.BOLD_ON;
    escpos += 'CANT  DESCRIPCION\n';
    escpos += CMD.BOLD_OFF;
    escpos += divider;

    let asciiText = `*** COCINA / BAR ***\nMESA: ${order.tableLabel || 'BARRA'}\nMESERO: ${order.waiterName || 'General'}\n${divider}`;

    for (const it of items) {
      escpos += CMD.DOUBLE_ON + `${it.quantity}x ${it.productName}\n` + CMD.DOUBLE_OFF;
      asciiText += `${it.quantity}x ${it.productName}\n`;
      if (it.notes) {
        escpos += `   >> NOTA: ${it.notes}\n`;
        asciiText += `   >> NOTA: ${it.notes}\n`;
      }
    }

    if (order.notes) {
      escpos += divider;
      escpos += `NOTA GRAL: ${order.notes}\n`;
      asciiText += `${divider}NOTA GRAL: ${order.notes}\n`;
    }

    escpos += divider;
    escpos += CMD.ALIGN_CENTER + '\n\n\n' + CMD.CUT;

    return reply.send({
      success: true,
      printerStation: 'kitchen',
      asciiPreview: asciiText,
      escposBase64: Buffer.from(escpos, 'binary').toString('base64'),
    });
  });

  // 3. Print Customer Receipt (Ticket Térmico de Venta)
  fastify.post('/api/hardware/print-receipt', async (request, reply) => {
    const { receiptId } = request.body as { receiptId: string };

    if (!receiptId) {
      return reply.status(400).send({ error: 'receiptId es requerido' });
    }

    const [receipt] = await db
      .select({
        id: schema.receipts.id,
        receiptNumber: schema.receipts.receiptNumber,
        subtotal: schema.receipts.subtotal,
        taxTotal: schema.receipts.taxTotal,
        discountTotal: schema.receipts.discountTotal,
        total: schema.receipts.total,
        issuedAt: schema.receipts.issuedAt,
        orderId: schema.receipts.orderId,
        venueName: schema.venues.name,
        venueAddress: schema.venues.address,
        venueSettings: schema.venues.settings,
      })
      .from(schema.receipts)
      .innerJoin(schema.orders, eq(schema.receipts.orderId, schema.orders.id))
      .innerJoin(schema.venues, eq(schema.orders.venueId, schema.venues.id))
      .where(eq(schema.receipts.id, receiptId))
      .limit(1);

    if (!receipt) {
      return reply.status(404).send({ error: 'Recibo no encontrado' });
    }

    const items = await db
      .select({
        quantity: schema.orderItems.quantity,
        unitPrice: schema.orderItems.unitPrice,
        productName: schema.products.name,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .where(eq(schema.orderItems.orderId, receipt.orderId));

    const payments = await db
      .select()
      .from(schema.receiptPayments)
      .where(eq(schema.receiptPayments.receiptId, receiptId));

    const settings = (receipt.venueSettings as any) || {};
    const companyName = settings.companyName || receipt.venueName;
    const taxId = settings.taxId || 'NIT: 900.123.456-7';
    const footerText = settings.receiptFooter || '¡Gracias por su visita!';

    const divider = '------------------------------------------\n';
    let escpos = CMD.INIT;
    escpos += CMD.ALIGN_CENTER + CMD.DOUBLE_ON + `${companyName}\n` + CMD.DOUBLE_OFF;
    escpos += `${taxId}\n`;
    escpos += `${receipt.venueAddress || ''}\n`;
    escpos += `FACTURA DE VENTA #${receipt.receiptNumber}\n`;
    escpos += `Fecha: ${new Date(receipt.issuedAt).toLocaleString('es-CO')}\n`;
    escpos += divider;
    escpos += CMD.ALIGN_LEFT;
    escpos += 'CANT  DESCRIPCION                 TOTAL\n';
    escpos += divider;

    let asciiText = `${companyName}\n${taxId}\nFACTURA #${receipt.receiptNumber}\n${divider}`;

    for (const it of items) {
      const lineTotal = Number(it.quantity) * Number(it.unitPrice);
      const nameCol = it.productName.padEnd(20, ' ').slice(0, 20);
      const row = `${it.quantity.toString().padEnd(4, ' ')} ${nameCol} $${lineTotal.toLocaleString('es-CO')}\n`;
      escpos += row;
      asciiText += row;
    }

    escpos += divider;
    escpos += CMD.ALIGN_RIGHT;
    escpos += `SUBTOTAL:  $${Number(receipt.subtotal).toLocaleString('es-CO')}\n`;
    escpos += `IVA (19%): $${Number(receipt.taxTotal).toLocaleString('es-CO')}\n`;
    if (Number(receipt.discountTotal) > 0) {
      escpos += `DESCUENTO: -$${Number(receipt.discountTotal).toLocaleString('es-CO')}\n`;
    }
    escpos += CMD.BOLD_ON + CMD.DOUBLE_ON;
    escpos += `TOTAL: $${Number(receipt.total).toLocaleString('es-CO')}\n`;
    escpos += CMD.DOUBLE_OFF + CMD.BOLD_OFF;

    for (const pay of payments) {
      escpos += `PAGO (${pay.method.toUpperCase()}): $${Number(pay.amount).toLocaleString('es-CO')}\n`;
      if (Number(pay.tipAmount) > 0) {
        escpos += `PROPINA: $${Number(pay.tipAmount).toLocaleString('es-CO')}\n`;
      }
    }

    escpos += divider;
    escpos += CMD.ALIGN_CENTER;
    escpos += `${footerText}\n\n\n`;
    escpos += CMD.CUT;
    // Kick drawer on cash receipt
    escpos += CMD.DRAWER_PULSE;

    return reply.send({
      success: true,
      receiptNumber: receipt.receiptNumber,
      asciiPreview: asciiText,
      escposBase64: Buffer.from(escpos, 'binary').toString('base64'),
    });
  });

  // 4. Hardware Status
  fastify.get('/api/hardware/status', async (request, reply) => {
    return reply.send({
      online: true,
      driverMode: 'escpos_direct',
      paperWidth: '80mm',
      stations: [
        { id: 'cashier', name: 'Impresora Caja Principal', ip: '192.168.1.100:9100', status: 'ready' },
        { id: 'kitchen', name: 'Impresora Cocina Caliente', ip: '192.168.1.101:9100', status: 'ready' },
        { id: 'bar', name: 'Impresora Barra / Bebidas', ip: '192.168.1.102:9100', status: 'ready' },
      ],
      cashDrawer: { connected: true, triggerPin: 2 },
    });
  });
}
