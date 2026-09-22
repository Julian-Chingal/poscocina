import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IReservationRepository } from '../interfaces/reservation.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export class ReservationRepository implements IReservationRepository {
  constructor(private readonly database = db) {}

  async findReservations(venueId: string, date?: string) {
    return await this.database.query.reservations.findMany({
      where: (reservations, { eq, and }) =>
        date
          ? and(
              eq(reservations.venueId, venueId),
              sql`DATE(${reservations.reservationTime}) = ${date}::date`
            )
          : eq(reservations.venueId, venueId),
      with: { table: true, customer: true },
      orderBy: (reservations, { desc }) => [desc(reservations.reservationTime)],
    });
  }

  async findReservationById(id: string) {
    return await this.database.query.reservations.findFirst({
      where: (reservations, { eq }) => eq(reservations.id, id),
      with: { table: true, customer: true },
    });
  }

  async createReservation(data: any) {
    const [reservation] = await this.database
      .insert(schema.reservations)
      .values({
        venueId: data.venueId,
        tableId: data.tableId || null,
        customerId: data.customerId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone || 'N/A',
        guestCount: data.guestCount || 2,
        reservationTime: new Date(data.reservationTime),
        status: 'pending',
        notes: data.notes || null,
      })
      .returning();
    return reservation;
  }

  async updateReservation(id: string, data: any) {
    const [updated] = await this.database
      .update(schema.reservations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.reservations.id, id))
      .returning();
    return updated;
  }

  async seatReservation(reservationId: string, waiterId?: string, targetTableId?: string) {
    const reservation = await this.findReservationById(reservationId);
    if (!reservation) throw new NotFoundError('Reserva no encontrada');

    const tableId = targetTableId || reservation.tableId;
    if (!tableId) throw new BadRequestError('Debe asignarse una mesa para sentar la reserva');

    return await this.database.transaction(async (tx) => {
      const [order] = await tx
        .insert(schema.orders)
        .values({
          venueId: reservation.venueId,
          tableId,
          customerId: reservation.customerId || null,
          waiterId: waiterId || null,
          orderType: 'dine_in',
          status: 'sent_to_kitchen',
          guestCount: reservation.guestCount,
          subtotal: '0.00',
          taxTotal: '0.00',
          total: '0.00',
          notes: reservation.notes ? `[Reserva]: ${reservation.notes}` : '[De Reserva]',
        })
        .returning();

      await tx
        .update(schema.tables)
        .set({ status: 'occupied', currentOrderId: order.id, updatedAt: new Date() })
        .where(eq(schema.tables.id, tableId));

      await tx
        .update(schema.reservations)
        .set({ status: 'seated', tableId, updatedAt: new Date() })
        .where(eq(schema.reservations.id, reservationId));

      return { reservation, order, tableId };
    });
  }
}

export const reservationRepository = new ReservationRepository();
