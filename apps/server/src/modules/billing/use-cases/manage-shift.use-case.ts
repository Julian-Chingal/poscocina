import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { ICashShiftRepository } from '../interfaces/billing.repository.interface.js';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export class ManageShiftUseCase {
  constructor(private readonly shiftRepo: ICashShiftRepository) {}

  async getCurrentShift(venueId: string) {
    const activeShift = await this.shiftRepo.findActiveShiftByVenue(venueId);
    if (!activeShift) return { open: false };

    const salesByMethod = await this.shiftRepo.getSalesByMethod(activeShift.id);
    return {
      open: true,
      shift: activeShift,
      salesByMethod,
    };
  }

  async openShift(venueId: string, openingAmount: number, cashierId?: string, notes?: string) {
    const existing = await this.shiftRepo.findActiveShiftByVenue(venueId);
    if (existing) {
      throw new BadRequestError('Ya existe un turno de caja abierto en este local comercial.');
    }

    let assignedCashierId = cashierId;
    if (!assignedCashierId) {
      const [firstUser] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.venueId, venueId))
        .limit(1);

      if (!firstUser) {
        throw new NotFoundError('No hay usuarios registrados en este local para asociar el turno');
      }
      assignedCashierId = firstUser.id;
    }

    return await this.shiftRepo.createShift({
      venueId,
      cashierId: assignedCashierId,
      openingAmount: openingAmount.toFixed(2),
      notes,
    });
  }

  async closeShift(shiftId: string, actualClosingAmount: number, notes?: string) {
    const shift = await this.shiftRepo.findShiftById(shiftId);
    if (!shift) throw new NotFoundError('Turno de caja no encontrado.');
    if (shift.status === 'closed') throw new BadRequestError('Este turno de caja ya se encuentra cerrado.');

    const aggregates = await this.shiftRepo.getShiftAggregates(shiftId);
    const opening = parseFloat(shift.openingAmount);
    const cashSales = parseFloat(aggregates.cashSales);
    const expected = opening + cashSales;
    const actual = actualClosingAmount;
    const difference = actual - expected;

    const diffNote = `Diferencia: $${difference.toFixed(2)}`;
    const finalNotes = notes ? `${notes} [${diffNote}]` : diffNote;

    const closedShift = await this.shiftRepo.closeShift(shiftId, {
      closingAmount: actual.toFixed(2),
      expectedAmount: expected.toFixed(2),
      notes: finalNotes,
    });

    return { shift: closedShift, expected, actual, difference };
  }
}
