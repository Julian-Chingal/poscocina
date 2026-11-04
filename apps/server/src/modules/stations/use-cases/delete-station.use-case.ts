import { IStationRepository, StationEntity } from '../interfaces/station.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export class DeleteStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(id: string, venueId: string): Promise<StationEntity> {
    const station = await this.stationRepository.findById(id);
    if (!station || station.venueId !== venueId) {
      throw new NotFoundError('Estación de trabajo no encontrada');
    }

    const hasActive = await this.stationRepository.hasActiveOrders(id);
    if (hasActive) {
      throw new BadRequestError('No se puede desactivar la estación porque tiene comandas activas en preparación');
    }

    return this.stationRepository.softDelete(id);
  }
}
