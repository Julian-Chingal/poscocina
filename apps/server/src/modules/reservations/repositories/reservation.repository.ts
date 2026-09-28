import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IReservationRepository } from '../interfaces/reservation.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export interface ReservationFilters {
  status?: string;
  date?: string;
  timeframe?: string;
  search?: string;
}

export class ReservationRepository implements IReservationRepository {
  constructor(private readonly database = db) {}

  async findReservations(venueId: string, filters?: ReservationFilters | string) {
    const filterObj: ReservationFilters =
      typeof filters === 'string' ? { date: filters } : (filters || {});

    const conditions = [eq(schema.reservations.venueId, venueId)];

    if (filterObj.status && filterObj.status !== 'all') {
      if (filterObj.status === 'history') {
        conditions.push(sql`${schema.reservations.status} IN ('seated', 'cancelled', 'no_show')`);
      } else {
        conditions.push(eq(schema.reservations.status, filterObj.status));
      }
    }

    if (filterObj.date) {
      conditions.push(sql`DATE(${schema.reservations.reservationTime}) = ${filterObj.date}::date`);
    } else if (filterObj.timeframe) {
      if (filterObj.timeframe === 'today') {
        conditions.push(sql`DATE(${schema.reservations.reservationTime}) = CURRENT_DATE`);
      } else if (filterObj.timeframe === 'tomorrow') {
        conditions.push(sql`DATE(${schema.reservations.reservationTime}) = CURRENT_DATE + INTERVAL '1 day'`);
      } else if (filterObj.timeframe === 'week') {
        conditions.push(
          sql`DATE(${schema.reservations.reservationTime}) >= CURRENT_DATE AND DATE(${schema.reservations.reservationTime}) <= CURRENT_DATE + INTERVAL '7 days'`
        );
      } else if (filterObj.timeframe === 'upcoming') {
        conditions.push(sql`${schema.reservations.reservationTime} >= NOW() - INTERVAL '3 hours'`);
      }
    }

    if (filterObj.search && filterObj.search.trim()) {
      const term = `%${filterObj.search.trim()}%`;
      conditions.push(
        sql`(${schema.reservations.customerName} ILIKE ${term} OR ${schema.reservations.customerPhone} ILIKE ${term})`
      );
    }

    const isDesc = filterObj.status === 'history' || filterObj.status === 'cancelled';

    return await this.database.query.reservations.findMany({
      where: and(...conditions),
      with: { table: true, customer: true },
      orderBy: [isDesc ? desc(schema.reservations.reservationTime) : sql`${schema.reservations.reservationTime} ASC`],
    });
  }

  async getReservationMetrics(venueId: string, timeframe?: string, date?: string) {
    const conditions = [eq(schema.reservations.venueId, venueId)];

    if (date) {
      conditions.push(sql`DATE(${schema.reservations.reservationTime}) = ${date}::date`);
    } else if (timeframe) {
      if (timeframe === 'today') {
        conditions.push(sql`DATE(${schema.reservations.reservationTime}) = CURRENT_DATE`);
      } else if (timeframe === 'tomorrow') {
        conditions.push(sql`DATE(${schema.reservations.reservationTime}) = CURRENT_DATE + INTERVAL '1 day'`);
      } else if (timeframe === 'week') {
        conditions.push(
          sql`DATE(${schema.reservations.reservationTime}) >= CURRENT_DATE AND DATE(${schema.reservations.reservationTime}) <= CURRENT_DATE + INTERVAL '7 days'`
        );
      } else if (timeframe === 'upcoming') {
        conditions.push(sql`${schema.reservations.reservationTime} >= NOW() - INTERVAL '3 hours'`);
      }
    }

    const [metrics] = await this.database
      .select({
        pendingCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} = 'pending'), 0)::int`,
        confirmedCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} = 'confirmed'), 0)::int`,
        seatedCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} = 'seated'), 0)::int`,
        cancelledCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} = 'cancelled'), 0)::int`,
        noShowCount: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} = 'no_show'), 0)::int`,
        totalActive: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${schema.reservations.status} IN ('pending', 'confirmed', 'seated')), 0)::int`,
        totalGuests: sql<number>`COALESCE(SUM(${schema.reservations.guestCount}) FILTER (WHERE ${schema.reservations.status} IN ('pending', 'confirmed', 'seated')), 0)::int`,
      })
      .from(schema.reservations)
      .where(and(...conditions));

    return metrics || {
      pendingCount: 0,
      confirmedCount: 0,
      seatedCount: 0,
      cancelledCount: 0,
      noShowCount: 0,
      totalActive: 0,
      totalGuests: 0,
    };
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
