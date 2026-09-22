import { IPrinterRepository, IPrinterDriver } from '../interfaces/hardware.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export class PrintShiftSummaryUseCase {
  constructor(
    private readonly printerRepo: IPrinterRepository,
    private readonly driver: IPrinterDriver
  ) {}

  async execute(shiftId: string) {
    const shift = await this.printerRepo.findCashShiftForPrint(shiftId);
    if (!shift) throw new NotFoundError('Turno de caja no encontrado');

    const venue = shift.venue;
    const printers = await this.printerRepo.findPrintersByVenue(shift.venueId);
    const cashierPrinter = printers.find((p) => p.station === 'cashier') || printers[0];
    const paperWidth = (cashierPrinter?.paperWidth === '58' ? '58' : '80') as '58' | '80';

    const salesByMethod = await db
      .select({
        method: schema.receiptPayments.method,
        total: sql<string>`sum(${schema.receiptPayments.amount})`,
        tips: sql<string>`sum(${schema.receiptPayments.tipAmount})`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, shiftId))
      .groupBy(schema.receiptPayments.method);

    const salesList = salesByMethod.map((s) => ({
      method: s.method,
      total: parseFloat(s.total || '0'),
      tips: parseFloat(s.tips || '0'),
    }));

    const totalSales = salesList.reduce((acc, s) => acc + s.total, 0);
    const totalTips = salesList.reduce((acc, s) => acc + s.tips, 0);
    const initialCash = parseFloat(shift.openingAmount);
    const cashSales = salesList.find((s) => s.method === 'cash')?.total || 0;
    const cardSales = salesList.filter((s) => s.method.includes('card')).reduce((acc, s) => acc + s.total, 0);
    const transferSales = salesList.find((s) => s.method === 'transfer')?.total || 0;
    const actualCash = shift.closingAmount ? parseFloat(shift.closingAmount) : 0;
    const expectedCash = shift.expectedAmount ? parseFloat(shift.expectedAmount) : initialCash + cashSales;

    const { escposBuffer, asciiPreview } = this.driver.generateShiftSummaryTicket({
      companyName: venue?.name || 'Mi Restaurante',
      venueName: venue?.name || 'Sede Principal',
      cashierName: shift.cashier?.name || 'Cajero',
      shiftNumber: 1,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt || new Date(),
      paperWidth,
      initialCash,
      cashSales,
      cardSales,
      transferSales,
      totalSales,
      totalTips,
      expectedCash,
      actualCash,
      discrepancy: actualCash - expectedCash,
    });

    let networkSent = false;
    let networkError: string | undefined;

    if (cashierPrinter?.connectionType === 'network_tcp' && cashierPrinter.ipAddress?.trim()) {
      const sendResult = await this.driver.sendToNetworkPrinter(cashierPrinter.ipAddress, cashierPrinter.port, escposBuffer);
      networkSent = sendResult.success;
      networkError = sendResult.error;
    }

    return {
      printerId: cashierPrinter?.id,
      printerName: cashierPrinter?.name || 'Caja Virtual',
      paperWidth,
      networkSent,
      networkError,
      asciiPreview,
    };
  }
}
