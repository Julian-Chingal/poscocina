import { FastifyRequest, FastifyReply } from 'fastify';
import { reservationsService } from '../services/reservations.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { CreateReservationSchema, UpdateReservationStatusSchema, SeatReservationSchema } from '@poscocina/shared';
import { BadRequestError } from '../errors/app-error.js';

export class ReservationsController {
  async getReservations(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { date } = request.query as { date?: string };

    const results = await reservationsService.getReservations(venueId, date);
    return reply.send(results);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const reservation = await reservationsService.getReservationById(id);
    return reply.send(reservation);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const parsed = CreateReservationSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const reservation = await reservationsService.createReservation({
      ...parsed.data,
      venueId,
    });

    request.server.io?.emit('reservation:created', reservation);
    if (reservation.tableId) {
      request.server.io?.emit('table:status_changed', {
        tableId: reservation.tableId,
        status: 'reserved',
      });
    }

    return reply.status(201).send(reservation);
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = UpdateReservationStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const updated = await reservationsService.updateReservationStatus(id, parsed.data.status, parsed.data.notes);

    request.server.io?.emit('reservation:status_changed', updated);
    return reply.send(updated);
  }

  async seat(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parsed = SeatReservationSchema.safeParse(request.body || {});
    const waiterId = parsed.success ? parsed.data.waiterId || (request.user as any)?.id : (request.user as any)?.id;
    const tableId = parsed.success ? parsed.data.tableId || undefined : undefined;

    const result = await reservationsService.seatReservation(id, waiterId, tableId);

    request.server.io?.emit('table:status_changed', {
      tableId: result.tableId,
      status: 'occupied',
      currentOrderId: result.order.id,
    });
    request.server.io?.emit('order:created', result.order);
    request.server.io?.emit('reservation:seated', { reservationId: id, tableId: result.tableId });

    return reply.send(result);
  }
}

export const reservationsController = new ReservationsController();
