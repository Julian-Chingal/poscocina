import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { auditService } from './audit.service.js';
import { printerDriverService, CMD } from './printer-driver.service.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import type {
  CreatePrinterInput,
  UpdatePrinterInput,
  TestPrintInput,
} from '@poscocina/shared';

export class HardwareService {
  // --- PRINTERS CRUD ---
  async getPrinters(venueId: string) {
    return await db.query.printers.findMany({
      where: (printers, { eq }) => eq(printers.venueId, venueId),
      orderBy: (printers, { asc }) => [asc(printers.name)],
    });
  }

  async getPrinterById(id: string) {
    const printer = await db.query.printers.findFirst({
      where: (printers, { eq }) => eq(printers.id, id),
    });
    if (!printer) {
      throw new NotFoundError('Impresora no encontrada');
    }
    return printer;
  }

  async createPrinter(data: CreatePrinterInput) {
    const [created] = await db
      .insert(schema.printers)
      .values({
        venueId: data.venueId,
        name: data.name.trim(),
        station: data.station || 'kitchen',
        connectionType: data.connectionType || 'network_tcp',
        ipAddress: data.ipAddress?.trim() || null,
        port: data.port || 9100,
        paperWidth: data.paperWidth || '80',
        autoPrintOnOrder: data.autoPrintOnOrder ?? true,
        autoPrintOnPayment: data.autoPrintOnPayment ?? true,
        openDrawerOnPrint: data.openDrawerOnPrint ?? false,
        isActive: data.isActive ?? true,
      })
      .returning();

    return created;
  }

  async updatePrinter(id: string, data: UpdatePrinterInput) {
    await this.getPrinterById(id);

    const [updated] = await db
      .update(schema.printers)
      .set({
        ...(data.name && { name: data.name.trim() }),
        ...(data.station && { station: data.station }),
        ...(data.connectionType && { connectionType: data.connectionType }),
        ...(data.ipAddress !== undefined && { ipAddress: data.ipAddress ? data.ipAddress.trim() : null }),
        ...(data.port !== undefined && { port: data.port }),
        ...(data.paperWidth && { paperWidth: data.paperWidth }),
        ...(data.autoPrintOnOrder !== undefined && { autoPrintOnOrder: data.autoPrintOnOrder }),
        ...(data.autoPrintOnPayment !== undefined && { autoPrintOnPayment: data.autoPrintOnPayment }),
        ...(data.openDrawerOnPrint !== undefined && { openDrawerOnPrint: data.openDrawerOnPrint }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(schema.printers.id, id))
      .returning();

    return updated;
  }

  async deletePrinter(id: string) {
    await this.getPrinterById(id);
    await db.delete(schema.printers).where(eq(schema.printers.id, id));
    return { success: true, message: 'Impresora eliminada correctamente' };
  }

  // --- MULTISTATION KITCHEN PRINTING ---
  async printKitchenTickets(
    venueId: string,
    orderId: string,
    options?: { specificStation?: string; isAppend?: boolean }
  ) {
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: {
        table: true,
        waiter: true,
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    const printers = await db.query.printers.findMany({
      where: (printers, { and, eq }) =>
        and(eq(printers.venueId, venueId), eq(printers.isActive, true)),
    });

    const stationItemsMap: Record<string, any[]> = {};

    for (const it of order.items) {
      const station =
        it.product?.printerStation || it.product?.category?.printerStation || 'kitchen';

      if (options?.specificStation && station !== options.specificStation) {
        continue;
      }

      if (!stationItemsMap[station]) {
        stationItemsMap[station] = [];
      }
      stationItemsMap[station].push({
        quantity: it.quantity,
        productName: it.product?.name || 'Producto',
        notes: it.notes,
      });
    }

    const results = [];

    for (const [station, items] of Object.entries(stationItemsMap)) {
      if (items.length === 0) continue;

      const printer =
        printers.find((p) => p.station === station) ||
        printers.find((p) => p.station === 'kitchen');

      const paperWidth = (printer?.paperWidth === '58' ? '58' : '80') as '58' | '80';
      const stationDisplayName =
        station === 'bar'
          ? 'BARRA / BEBIDAS'
          : station === 'dessert'
          ? 'POSTRES / CAFE'
          : 'COCINA CALIENTE';

      const { escposBuffer, asciiPreview } = printerDriverService.generateKitchenTicket({
        stationName: stationDisplayName,
        orderId: order.id,
        tableLabel: order.table?.label,
        waiterName: order.waiter?.name,
        openedAt: order.openedAt,
        notes: order.notes,
        isAppend: options?.isAppend,
        paperWidth,
        items,
      });

      let networkSent = false;
      let networkError: string | undefined;

      if (
        printer &&
        printer.connectionType === 'network_tcp' &&
        printer.ipAddress &&
        printer.ipAddress.trim().length > 0
      ) {
        const sendResult = await printerDriverService.sendToNetworkPrinter(
          printer.ipAddress,
          printer.port,
          escposBuffer
        );
        networkSent = sendResult.success;
        networkError = sendResult.error;
      }

      results.push({
        station,
        printerName: printer?.name || `Impresora Virtual (${station})`,
        printerId: printer?.id,
        networkSent,
        networkError,
        asciiPreview,
        escposBase64: escposBuffer.toString('base64'),
      });
    }

    return {
      success: true,
      orderId: order.id,
      tickets: results,
    };
  }

  // --- CUSTOMER RECEIPT PRINTING ---
  async printCustomerReceipt(receiptId: string, targetPrinterId?: string) {
    const receipt = await db.query.receipts.findFirst({
      where: (receipts, { eq }) => eq(receipts.id, receiptId),
      with: {
        order: {
          with: {
            table: true,
            waiter: true,
            venue: true,
            customer: true,
            items: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundError('Recibo no encontrado');
    }

    const payments = await db
      .select()
      .from(schema.receiptPayments)
      .where(eq(schema.receiptPayments.receiptId, receiptId));

    const venue = receipt.order.venue;
    const settings = (venue.settings as Record<string, unknown>) || {};
    const companyName = (settings.companyName as string) || venue.name;
    const taxId = (settings.taxId as string) || 'NIT: 900.123.456-7';
    const address = venue.address || undefined;
    const phone = (settings.phone as string) || undefined;
    const headerNote = (settings.receiptHeader as string) || undefined;
    const footerText = (settings.receiptFooter as string) || '¡Gracias por su visita!';

    let printer;
    if (targetPrinterId) {
      printer = await db.query.printers.findFirst({
        where: (printers, { eq }) => eq(printers.id, targetPrinterId),
      });
    }
    if (!printer) {
      printer = await db.query.printers.findFirst({
        where: (printers, { and, eq }) =>
          and(
            eq(printers.venueId, venue.id),
            eq(printers.station, 'cashier'),
            eq(printers.isActive, true)
          ),
      });
    }

    const paperWidth = (printer?.paperWidth === '58' ? '58' : '80') as '58' | '80';
    const openDrawer = printer ? printer.openDrawerOnPrint : true;

    const receiptItems = receipt.order.items.map((it) => ({
      quantity: it.quantity,
      productName: it.product?.name || 'Producto',
      unitPrice: it.unitPrice,
      total: Number(it.quantity) * Number(it.unitPrice),
    }));

    const receiptPayments = payments.map((p) => ({
      method: p.method,
      amount: Number(p.amount),
      tipAmount: Number(p.tipAmount || 0),
    }));

    const tipSum = receiptPayments.reduce((acc, p) => acc + (p.tipAmount || 0), 0);

    const { escposBuffer, asciiPreview } = printerDriverService.generateReceiptTicket({
      companyName,
      taxId,
      address,
      phone,
      headerNote,
      receiptNumber: receipt.receiptNumber.toString(),
      issuedAt: receipt.issuedAt,
      tableLabel: receipt.order.table?.label,
      waiterName: receipt.order.waiter?.name,
      customerName: receipt.order.customer?.name,
      customerDoc: receipt.order.customer?.documentNumber,
      loyaltyPoints: receipt.order.customer?.loyaltyPoints || 0,
      subtotal: Number(receipt.subtotal),
      taxTotal: Number(receipt.taxTotal),
      discountTotal: Number(receipt.discountTotal),
      total: Number(receipt.total),
      tipAmount: tipSum,
      footerText,
      openDrawer,
      paperWidth,
      items: receiptItems,
      payments: receiptPayments,
    });

    let networkSent = false;
    let networkError: string | undefined;

    if (
      printer &&
      printer.connectionType === 'network_tcp' &&
      printer.ipAddress &&
      printer.ipAddress.trim().length > 0
    ) {
      const sendResult = await printerDriverService.sendToNetworkPrinter(
        printer.ipAddress,
        printer.port,
        escposBuffer
      );
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      success: true,
      receiptNumber: receipt.receiptNumber.toString(),
      printerName: printer?.name || 'Impresora Caja',
      networkSent,
      networkError,
      asciiPreview,
      escposBase64: escposBuffer.toString('base64'),
    };
  }

  // --- PRE-CHECK PRINTING ---
  async printPreCheck(orderId: string, targetPrinterId?: string) {
    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: {
        table: true,
        waiter: true,
        venue: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    const venue = order.venue;
    const settings = (venue.settings as Record<string, unknown>) || {};
    const companyName = (settings.companyName as string) || venue.name;

    let printer;
    if (targetPrinterId) {
      printer = await db.query.printers.findFirst({
        where: (printers, { eq }) => eq(printers.id, targetPrinterId),
      });
    }
    if (!printer) {
      printer = await db.query.printers.findFirst({
        where: (printers, { and, eq }) =>
          and(
            eq(printers.venueId, venue.id),
            eq(printers.station, 'cashier'),
            eq(printers.isActive, true)
          ),
      });
    }

    const paperWidth = (printer?.paperWidth === '58' ? '58' : '80') as '58' | '80';

    const subtotal = order.items.reduce(
      (sum, it) => sum + Number(it.quantity) * Number(it.unitPrice),
      0
    );

    const taxTotal = Math.round(subtotal * 0.08); // 8% INC standard
    const total = subtotal + taxTotal;
    const suggestedTip = Math.round(total * 0.1);
    const totalWithTip = total + suggestedTip;

    const items = order.items.map((it) => ({
      quantity: it.quantity,
      productName: it.product?.name || 'Producto',
      total: Number(it.quantity) * Number(it.unitPrice),
    }));

    const { escposBuffer, asciiPreview } = printerDriverService.generatePreCheckTicket({
      companyName,
      tableLabel: order.table?.label,
      waiterName: order.waiter?.name,
      subtotal,
      taxTotal,
      total,
      suggestedTip,
      totalWithTip,
      paperWidth,
      items,
    });

    let networkSent = false;
    let networkError: string | undefined;

    if (
      printer &&
      printer.connectionType === 'network_tcp' &&
      printer.ipAddress &&
      printer.ipAddress.trim().length > 0
    ) {
      const sendResult = await printerDriverService.sendToNetworkPrinter(
        printer.ipAddress,
        printer.port,
        escposBuffer
      );
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      success: true,
      orderId: order.id,
      printerName: printer?.name || 'Impresora Caja',
      networkSent,
      networkError,
      asciiPreview,
      escposBase64: escposBuffer.toString('base64'),
    };
  }

  // --- SHIFT SUMMARY (Z-REPORT) PRINTING ---
  async printShiftSummary(shiftId: string, targetPrinterId?: string) {
    const [shift] = await db
      .select({
        id: schema.cashShifts.id,
        venueId: schema.cashShifts.venueId,
        openedAt: schema.cashShifts.openedAt,
        closedAt: schema.cashShifts.closedAt,
        openingAmount: schema.cashShifts.openingAmount,
        closingAmount: schema.cashShifts.closingAmount,
        expectedAmount: schema.cashShifts.expectedAmount,
        notes: schema.cashShifts.notes,
        cashierName: schema.users.name,
        venueName: schema.venues.name,
        venueSettings: schema.venues.settings,
      })
      .from(schema.cashShifts)
      .leftJoin(schema.users, eq(schema.cashShifts.cashierId, schema.users.id))
      .leftJoin(schema.venues, eq(schema.cashShifts.venueId, schema.venues.id))
      .where(eq(schema.cashShifts.id, shiftId));

    if (!shift) {
      throw new NotFoundError('Turno de caja no encontrado');
    }

    const settings = (shift.venueSettings as Record<string, unknown>) || {};
    const companyName = (settings.companyName as string) || shift.venueName || 'Restaurante';

    const [salesAggregate] = await db
      .select({
        totalSales: sql<string>`coalesce(sum(${schema.receiptPayments.amount}), 0)`,
        cashSales: sql<string>`coalesce(sum(case when ${schema.receiptPayments.method} = 'cash' then ${schema.receiptPayments.amount} else 0 end), 0)`,
        cardSales: sql<string>`coalesce(sum(case when ${schema.receiptPayments.method} = 'card' then ${schema.receiptPayments.amount} else 0 end), 0)`,
        transferSales: sql<string>`coalesce(sum(case when ${schema.receiptPayments.method} = 'transfer' then ${schema.receiptPayments.amount} else 0 end), 0)`,
        totalTips: sql<string>`coalesce(sum(${schema.receiptPayments.tipAmount}), 0)`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, shiftId));

    let printer;
    if (targetPrinterId) {
      printer = await db.query.printers.findFirst({
        where: (printers, { eq }) => eq(printers.id, targetPrinterId),
      });
    }
    if (!printer) {
      printer = await db.query.printers.findFirst({
        where: (printers, { and, eq }) =>
          and(
            eq(printers.venueId, shift.venueId),
            eq(printers.station, 'cashier'),
            eq(printers.isActive, true)
          ),
      });
    }

    const paperWidth = (printer?.paperWidth === '58' ? '58' : '80') as '58' | '80';

    const initialCash = Number(shift.openingAmount || 0);
    const cashSales = Number(salesAggregate?.cashSales || 0);
    const cardSales = Number(salesAggregate?.cardSales || 0);
    const transferSales = Number(salesAggregate?.transferSales || 0);
    const totalSales = Number(salesAggregate?.totalSales || 0);
    const totalTips = Number(salesAggregate?.totalTips || 0);
    const expectedCash = initialCash + cashSales;
    const actualCash = Number(shift.closingAmount || expectedCash);
    const discrepancy = actualCash - expectedCash;

    const { escposBuffer, asciiPreview } = printerDriverService.generateShiftSummaryTicket({
      companyName,
      venueName: shift.venueName || 'Local',
      cashierName: shift.cashierName || 'Cajero',
      shiftNumber: 1,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt || new Date(),
      initialCash,
      cashSales,
      cardSales,
      transferSales,
      totalSales,
      totalTips,
      expectedCash,
      actualCash,
      discrepancy,
      paperWidth,
    });

    let networkSent = false;
    let networkError: string | undefined;

    if (
      printer &&
      printer.connectionType === 'network_tcp' &&
      printer.ipAddress &&
      printer.ipAddress.trim().length > 0
    ) {
      const sendResult = await printerDriverService.sendToNetworkPrinter(
        printer.ipAddress,
        printer.port,
        escposBuffer
      );
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      success: true,
      shiftId: shift.id,
      printerName: printer?.name || 'Impresora Caja',
      networkSent,
      networkError,
      asciiPreview,
      escposBase64: escposBuffer.toString('base64'),
    };
  }

  // --- TEST PRINTER ---
  async testPrinter(venueId: string, data: TestPrintInput) {
    let name = 'Impresora de Prueba';
    let ip = data.ipAddress;
    let port = data.port || 9100;
    let paperWidth: '58' | '80' = data.paperWidth === '58' ? '58' : '80';

    if (data.printerId) {
      const p = await this.getPrinterById(data.printerId);
      name = p.name;
      ip = p.ipAddress || undefined;
      port = p.port;
      paperWidth = p.paperWidth === '58' ? '58' : '80';
    }

    const { escposBuffer, asciiPreview } = printerDriverService.generateTestTicket(
      name,
      ip,
      paperWidth
    );

    let networkSent = false;
    let networkError: string | undefined;

    if (ip && ip.trim().length > 0) {
      const sendResult = await printerDriverService.sendToNetworkPrinter(ip, port, escposBuffer);
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      success: true,
      printerName: name,
      networkSent,
      networkError,
      asciiPreview,
      escposBase64: escposBuffer.toString('base64'),
    };
  }

  // --- CASH DRAWER KICK ---
  async triggerDrawerKick(
    venueId: string | null,
    clientInfo?: { ip?: string; userAgent?: string; userId?: string }
  ) {
    await auditService.log({
      venueId: venueId || undefined,
      userId: clientInfo?.userId,
      action: 'cash_drawer:manual_open',
      entityType: 'hardware',
      entityId: 'cash_drawer',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      payload: { reason: 'manual_kick' },
    });

    let networkSent = false;

    if (venueId) {
      const cashierPrinter = await db.query.printers.findFirst({
        where: (printers, { and, eq }) =>
          and(
            eq(printers.venueId, venueId),
            eq(printers.station, 'cashier'),
            eq(printers.isActive, true)
          ),
      });

      if (
        cashierPrinter &&
        cashierPrinter.connectionType === 'network_tcp' &&
        cashierPrinter.ipAddress
      ) {
        const pulseBuffer = Buffer.from(CMD.DRAWER_PULSE, 'binary');
        const res = await printerDriverService.sendToNetworkPrinter(
          cashierPrinter.ipAddress,
          cashierPrinter.port,
          pulseBuffer,
          2000
        );
        networkSent = res.success;
      }
    }

    return {
      success: true,
      networkSent,
      message: 'Pulso de apertura de gaveta emitido (ESC/POS pin 2)',
      escposCommand: Buffer.from(CMD.DRAWER_PULSE, 'binary').toString('base64'),
    };
  }

  getHardwareStatus() {
    return {
      online: true,
      driverMode: 'escpos_network_raw_9100',
      standardPort: 9100,
      cashDrawer: { connected: true, triggerPin: 2 },
    };
  }
}

export const hardwareService = new HardwareService();
