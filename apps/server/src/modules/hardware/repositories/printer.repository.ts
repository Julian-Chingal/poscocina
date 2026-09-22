import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IPrinterRepository, PrinterRecord } from '../interfaces/hardware.interface.js';

export class PrinterRepository implements IPrinterRepository {
  constructor(private readonly database = db) {}

  async findPrintersByVenue(venueId: string): Promise<PrinterRecord[]> {
    const list = await this.database.query.printers.findMany({
      where: (printers, { eq }) => eq(printers.venueId, venueId),
      orderBy: (printers, { asc }) => [asc(printers.name)],
    });
    return list as PrinterRecord[];
  }

  async findPrinterById(id: string): Promise<PrinterRecord | null> {
    const printer = await this.database.query.printers.findFirst({
      where: (printers, { eq }) => eq(printers.id, id),
    });
    return (printer as PrinterRecord) || null;
  }

  async createPrinter(data: any): Promise<PrinterRecord> {
    const [created] = await this.database.insert(schema.printers).values(data).returning();
    return created as PrinterRecord;
  }

  async updatePrinter(id: string, data: any): Promise<PrinterRecord> {
    const [updated] = await this.database.update(schema.printers).set(data).where(eq(schema.printers.id, id)).returning();
    return updated as PrinterRecord;
  }

  async deletePrinter(id: string): Promise<void> {
    await this.database.delete(schema.printers).where(eq(schema.printers.id, id));
  }

  async findOrderForPrint(orderId: string) {
    return await this.database.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: {
        table: true,
        waiter: { columns: { id: true, name: true } },
        venue: true,
        items: { with: { product: true, modifiers: true } },
      },
    });
  }

  async findReceiptForPrint(receiptId: string) {
    return await this.database.query.receipts.findFirst({
      where: (receipts, { eq }) => eq(receipts.id, receiptId),
      with: {
        customer: true,
        payments: true,
        order: {
          with: {
            table: true,
            waiter: { columns: { id: true, name: true } },
            venue: true,
            items: { with: { product: true, modifiers: true } },
          },
        },
      },
    });
  }

  async findCashShiftForPrint(shiftId: string) {
    return await this.database.query.cashShifts.findFirst({
      where: (shifts, { eq }) => eq(shifts.id, shiftId),
      with: {
        cashier: { columns: { id: true, name: true } },
        venue: true,
      },
    });
  }
}

export const printerRepository = new PrinterRepository();
