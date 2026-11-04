import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateStationSchema, UpdateStationSchema } from '@poscocina/shared';
import { stationRepository } from './repositories/station.repository.js';
import { GetStationsUseCase } from './use-cases/get-stations.use-case.js';
import { CreateStationUseCase } from './use-cases/create-station.use-case.js';
import { UpdateStationUseCase } from './use-cases/update-station.use-case.js';
import { DeleteStationUseCase } from './use-cases/delete-station.use-case.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { validate } from '../../utils/validation.util.js';
import { NotFoundError } from '../../errors/app-error.js';

export class StationController {
  private readonly getStationsUseCase = new GetStationsUseCase(stationRepository);
  private readonly createStationUseCase = new CreateStationUseCase(stationRepository);
  private readonly updateStationUseCase = new UpdateStationUseCase(stationRepository);
  private readonly deleteStationUseCase = new DeleteStationUseCase(stationRepository);

  async getStations(request: FastifyRequest, reply: FastifyReply) {
    const { venueId: queryVenueId, all } = request.query as { venueId?: string; all?: string };
    const venueId = await resolveVenueId(request, queryVenueId);
    const onlyActive = all !== 'true';
    const stations = await this.getStationsUseCase.execute(venueId, onlyActive);
    return reply.send(stations);
  }

  async getStationById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { venueId: queryVenueId } = request.query as { venueId?: string };
    const venueId = await resolveVenueId(request, queryVenueId);
    const station = await stationRepository.findById(id);

    if (!station || station.venueId !== venueId) {
      throw new NotFoundError('Estación de trabajo no encontrada');
    }

    return reply.send(station);
  }

  async createStation(request: FastifyRequest, reply: FastifyReply) {
    const body = validate(CreateStationSchema, request.body);
    const venueId = await resolveVenueId(request, body.venueId);
    const station = await this.createStationUseCase.execute(venueId, body);
    return reply.status(201).send(station);
  }

  async updateStation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = validate(UpdateStationSchema, request.body);
    const venueId = await resolveVenueId(request);
    const updated = await this.updateStationUseCase.execute(id, venueId, body);
    return reply.send(updated);
  }

  async deleteStation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const venueId = await resolveVenueId(request);
    const deleted = await this.deleteStationUseCase.execute(id, venueId);
    return reply.send(deleted);
  }
}

export const stationController = new StationController();
