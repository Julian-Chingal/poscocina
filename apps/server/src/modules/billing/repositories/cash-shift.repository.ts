import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { ICashShiftRepository, CashShiftRecord, SalesByMethodAggregate } from '../interfaces/billing.repository.interface.js';

export class CashShiftRepository implements ICashShiftRepository {
  constructor(private readonly database = db) {}

  async findActiveShiftByVenue(venueId: string, tx = this.database): Promise<CashShiftRecord | null> {
    const [activeShift] = await tx
      .select()
      .from(schema.cashShifts)
      .where(and(eq(schema.cashShifts.venueId, venueId), eq(schema.cashShifts.status, 'open')))
      .orderBy(desc(schema.cashShifts.openedAt))
      .limit(1);

    return (activeShift as CashShiftRecord) || null;
  }

  async findShiftById(shiftId: string, tx = this.database): Promise<CashShiftRecord | null> {
    const [shift] = await tx
      .select()
      .from(schema.cashShifts)
      .where(eq(schema.cashShifts.id, shiftId))
      .limit(1);

    return (shift as CashShiftRecord) || null;
  }

  async getSalesByMethod(shiftId: string, tx = this.database): Promise<SalesByMethodAggregate[]> {
    return await tx
      .select({
        method: schema.receiptPayments.method,
        total: sql<string>`sum(${schema.receiptPayments.amount})`,
        tips: sql<string>`sum(${schema.receiptPayments.tipAmount})`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, shiftId))
      .groupBy(schema.receiptPayments.method);
  }

  async getShiftAggregates(shiftId: string, tx = this.database) {
    const [aggregate] = await tx
      .select({
        totalSales: sql<string>`coalesce(sum(${schema.receiptPayments.amount}), 0)`,
        cashSales: sql<string>`coalesce(sum(case when ${schema.receiptPayments.method} = 'cash' then ${schema.receiptPayments.amount} else 0 end), 0)`,
        totalTips: sql<string>`coalesce(sum(${schema.receiptPayments.tipAmount}), 0)`,
      })
      .from(schema.receiptPayments)
      .innerJoin(schema.receipts, eq(schema.receiptPayments.receiptId, schema.receipts.id))
      .where(eq(schema.receipts.cashShiftId, shiftId));

    return {
      totalSales: aggregate?.totalSales || '0',
      cashSales: aggregate?.cashSales || '0',
      totalTips: aggregate?.totalTips || '0',
    };
  }

  async createShift(
    data: { venueId: string; cashierId: string; openingAmount: string; notes?: string },
    tx = this.database
  ): Promise<CashShiftRecord> {
    const [newShift] = await tx
      .insert(schema.cashShifts)
      .values({
        venueId: data.venueId,
        cashierId: data.cashierId,
        openingAmount: data.openingAmount,
        status: 'open',
        notes: data.notes,
      })
      .returning();

    return newShift as CashShiftRecord;
  }

  async closeShift(
    shiftId: string,
    data: { closingAmount: string; expectedAmount: string; notes: string },
    tx = this.database
  ): Promise<CashShiftRecord> {
    const [closedShift] = await tx
      .update(schema.cashShifts)
      .set({
        status: 'closed',
        closedAt: new Date(),
        closingAmount: data.closingAmount,
        expectedAmount: data.expectedAmount,
        notes: data.notes,
      })
      .where(eq(schema.cashShifts.id, shiftId))
      .returning();

    return closedShift as CashShiftRecord;
  }
}

export const cashShiftRepository = new CashShiftRepository();
