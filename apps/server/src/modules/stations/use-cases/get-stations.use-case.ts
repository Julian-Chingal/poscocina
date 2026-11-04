import { IStationRepository, StationWithPrinter } from '../interfaces/station.repository.interface.js';

export class GetStationsUseCase {
  constructor(private readonly stationRepository: IStationRepository) {}

  async execute(venueId: string, onlyActive = true): Promise<StationWithPrinter[]> {
    return this.stationRepository.findByVenueId(venueId, onlyActive);
  }
}
