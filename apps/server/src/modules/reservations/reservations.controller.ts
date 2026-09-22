import { FastifyRequest, FastifyReply } from 'fastify';
import { reservationRepository } from './repositories/reservation.repository.js';
import { ManageReservationsUseCase } from './use-cases/manage-reservations.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { CreateReservationSchema, UpdateReservationStatusSchema, SeatReservationSchema } from '@poscocina/shared';

export class ReservationsController {
  private readonly useCase = new ManageReservationsUseCase(reservationRepository);

  async getReservations(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { date } = request.query as { date?: string };
    const results = await this.useCase.getReservations(venueId, date);
    return reply.send(results);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const reservation = await this.useCase.getById(id);
    return reply.send(reservation);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const data = validate(CreateReservationSchema, request.body);
    const reservation = await this.useCase.createReservation({ ...data, venueId });

    request.server.io?.emit('reservation:created', reservation);
    if (reservation.tableId) {
      request.server.io?.emit('table:status_changed', { tableId: reservation.tableId, status: 'reserved' });
    }
    return reply.status(201).send(reservation);
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = validate(UpdateReservationStatusSchema, request.body);
    const updated = await this.useCase.updateStatus(id, data.status, data.notes);

    request.server.io?.emit('reservation:status_changed', updated);
    return reply.send(updated);
  }

  async seat(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body ? validate(SeatReservationSchema, request.body) : {};
    const waiterId = data.waiterId || (request.user as any)?.id;
    const result = await this.useCase.seatReservation(id, waiterId, data.tableId || undefined);

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
