import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { auditService } from './audit.service.js';
import { NotFoundError } from '../errors/app-error.js';

// ESC/POS Command Constants
const ESC = '\x1B';
const GS = '\x1D';
export const CMD = {
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

export class HardwareService {
  async triggerDrawerKick(
    venueId: string | null,
    clientInfo?: { ip?: string; userAgent?: string; userId?: string }
  ) {
    await auditService.log({
      venueId: venueId || undefined,
      userId: clientInfo?.userId,
      action: 'DRAWER_KICK',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    return {
      success: true,
      message: 'Pulso de apertura de gaveta enviado (ESC/POS pin 2)',
      escposCommand: Buffer.from(CMD.DRAWER_PULSE, 'binary').toString('base64'),
    };
  }

  async printKitchenTicket(orderId: string) {
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
      throw new NotFoundError('Orden no encontrada');
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

    return {
      success: true,
      printerStation: 'kitchen',
      asciiPreview: asciiText,
      escposBase64: Buffer.from(escpos, 'binary').toString('base64'),
    };
  }

  async printCustomerReceipt(receiptId: string) {
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
      throw new NotFoundError('Recibo no encontrado');
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

    const settings = (receipt.venueSettings as Record<string, unknown>) || {};
    const companyName = (settings.companyName as string) || receipt.venueName;
    const taxId = (settings.taxId as string) || 'NIT: 900.123.456-7';
    const footerText = (settings.receiptFooter as string) || '¡Gracias por su visita!';

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
    escpos += CMD.DRAWER_PULSE;

    return {
      success: true,
      receiptNumber: receipt.receiptNumber,
      asciiPreview: asciiText,
      escposBase64: Buffer.from(escpos, 'binary').toString('base64'),
    };
  }

  getHardwareStatus() {
    return {
      online: true,
      driverMode: 'escpos_direct',
      paperWidth: '80mm',
      stations: [
        { id: 'cashier', name: 'Impresora Caja Principal', ip: '192.168.1.100:9100', status: 'ready' },
        { id: 'kitchen', name: 'Impresora Cocina Caliente', ip: '192.168.1.101:9100', status: 'ready' },
        { id: 'bar', name: 'Impresora Barra / Bebidas', ip: '192.168.1.102:9100', status: 'ready' },
      ],
      cashDrawer: { connected: true, triggerPin: 2 },
    };
  }
}

export const hardwareService = new HardwareService();
