import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import type { CreateReservationInput, ReservationStatus } from '@poscocina/shared';

export class ReservationsService {
  async getReservations(venueId: string, dateStr?: string) {
    let dateFilter = undefined;
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = and(
        gte(schema.reservations.reservationTime, startOfDay),
        lte(schema.reservations.reservationTime, endOfDay)
      );
    }

    return await db.query.reservations.findMany({
      where: (r, { and, eq }) =>
        dateFilter
          ? and(eq(r.venueId, venueId), dateFilter)
          : eq(r.venueId, venueId),
      with: {
        table: true,
        customer: true,
      },
      orderBy: (r, { asc }) => [asc(r.reservationTime)],
    });
  }

  async getReservationById(id: string) {
    const reservation = await db.query.reservations.findFirst({
      where: (r, { eq }) => eq(r.id, id),
      with: {
        table: true,
        customer: true,
      },
    });

    if (!reservation) {
      throw new NotFoundError('Reserva no encontrada');
    }

    return reservation;
  }

  async createReservation(data: CreateReservationInput & { venueId: string }) {
    const {
      venueId,
      tableId,
      customerId,
      customerName,
      customerPhone,
      guestCount,
      reservationTime,
      notes,
    } = data;

    const [newReservation] = await db
      .insert(schema.reservations)
      .values({
        venueId,
        tableId: tableId || null,
        customerId: customerId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        guestCount: guestCount || 2,
        reservationTime: new Date(reservationTime),
        status: 'confirmed',
        notes: notes?.trim() || null,
      })
      .returning();

    // If table assigned, mark table as 'reserved' if reservation is within next 2 hours
    if (tableId) {
      const resDate = new Date(reservationTime);
      const now = new Date();
      const diffHours = (resDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= -1 && diffHours <= 3) {
        await db
          .update(schema.tables)
          .set({ status: 'reserved', updatedAt: new Date() })
          .where(and(eq(schema.tables.id, tableId), eq(schema.tables.status, 'free')));
      }
    }

    return await this.getReservationById(newReservation.id);
  }

  async updateReservationStatus(id: string, status: ReservationStatus, notes?: string) {
    const [existing] = await db.select().from(schema.reservations).where(eq(schema.reservations.id, id)).limit(1);
    if (!existing) {
      throw new NotFoundError('Reserva no encontrada');
    }

    const [updated] = await db
      .update(schema.reservations)
      .set({
        status,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.reservations.id, id))
      .returning();

    // If cancelled or no_show, and table was reserved, free it if it has no active order
    if (['cancelled', 'no_show'].includes(status) && existing.tableId) {
      const [table] = await db.select().from(schema.tables).where(eq(schema.tables.id, existing.tableId)).limit(1);
      if (table && table.status === 'reserved' && !table.currentOrderId) {
        await db
          .update(schema.tables)
          .set({ status: 'free', updatedAt: new Date() })
          .where(eq(schema.tables.id, existing.tableId));
      }
    }

    return updated;
  }

  async seatReservation(reservationId: string, waiterId?: string, overrideTableId?: string) {
    const reservation = await this.getReservationById(reservationId);
    const targetTableId = overrideTableId || reservation.tableId;

    if (!targetTableId) {
      throw new BadRequestError('Debe asignar una mesa para sentar la reserva.');
    }

    return await db.transaction(async (tx) => {
      // 1. Mark reservation as seated
      await tx
        .update(schema.reservations)
        .set({ status: 'seated', tableId: targetTableId, updatedAt: new Date() })
        .where(eq(schema.reservations.id, reservationId));

      // 2. Open new order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          venueId: reservation.venueId,
          tableId: targetTableId,
          customerId: reservation.customerId || null,
          waiterId: waiterId || null,
          guestCount: reservation.guestCount,
          orderType: 'dine_in',
          status: 'open',
          notes: reservation.notes ? `[Reserva: ${reservation.customerName}] ${reservation.notes}` : `Reserva: ${reservation.customerName}`,
        })
        .returning();

      // 3. Occupy table
      await tx
        .update(schema.tables)
        .set({
          status: 'occupied',
          currentOrderId: newOrder.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.tables.id, targetTableId));

      return {
        reservationId,
        order: newOrder,
        tableId: targetTableId,
      };
    });
  }
}

export const reservationsService = new ReservationsService();
