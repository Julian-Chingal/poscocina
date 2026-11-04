import { CreateStationInput } from '@poscocina/shared';
import { IStationRepository, StationEntity } from '../interfaces/station.repository.interface.js';
import { ConflictError } from '../../../errors/app-error.js';

export class CreateStationUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(venueId: string, input: CreateStationInput): Promise<StationEntity> {
    const existing = await this.stationRepository.findByCode(venueId, input.code);
    if (existing) {
      throw new ConflictError(`Ya existe una estación con el código "${input.code}" en este establecimiento`);
    }

    return this.stationRepository.create({
      venueId,
      name: input.name,
      code: input.code,
      description: input.description ?? null,
      color: input.color ?? '#ea580c',
      icon: input.icon ?? 'ChefHat',
      printerId: input.printerId ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
  }
}
