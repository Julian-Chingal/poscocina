import { UpdateStationInput } from '@poscocina/shared';
import { IStationRepository, StationEntity } from '../interfaces/station.repository.interface.js';
import { NotFoundError, ConflictError } from '../../../errors/app-error.js';

export class UpdateStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(id: string, venueId: string, input: UpdateStationInput): Promise<StationEntity> {
    const station = await this.stationRepository.findById(id);
    if (!station || station.venueId !== venueId) {
      throw new NotFoundError('Estación de trabajo no encontrada');
    }

    if (input.code && input.code !== station.code) {
      const existing = await this.stationRepository.findByCode(venueId, input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Ya existe una estación con el código "${input.code}" en este establecimiento`);
      }
    }

    return this.stationRepository.update(id, input);
  }
}
