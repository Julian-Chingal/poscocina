import { IReservationRepository } from '../interfaces/reservation.repository.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManageReservationsUseCase {
  constructor(private readonly repo: IReservationRepository) {}

  async getReservations(venueId: string, date?: string) {
    return await this.repo.findReservations(venueId, date);
  }

  async getById(id: string) {
    const reservation = await this.repo.findReservationById(id);
    if (!reservation) throw new NotFoundError('Reserva no encontrada');
    return reservation;
  }

  async createReservation(data: any) {
    const created = await this.repo.createReservation(data);
    auditService.log({
      venueId: data.venueId,
      action: 'reservation:created',
      entityType: 'reservation',
      entityId: created.id,
      payload: { customerName: data.customerName, time: data.reservationTime },
    }).catch(() => {});
    return created;
  }

  async updateStatus(id: string, status: any, notes?: string) {
    const reservation = await this.getById(id);
    const updated = await this.repo.updateReservation(id, {
      status,
      ...(notes !== undefined && { notes }),
    });

    auditService.log({
      venueId: reservation.venueId,
      action: 'reservation:status_changed',
      entityType: 'reservation',
      entityId: id,
      payload: { previousStatus: reservation.status, newStatus: status },
    }).catch(() => {});

    return updated;
  }

  async seatReservation(id: string, waiterId?: string, targetTableId?: string) {
    return await this.repo.seatReservation(id, waiterId, targetTableId);
  }
}
