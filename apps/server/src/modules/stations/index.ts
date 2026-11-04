import { FastifyInstance } from 'fastify';
import { stationRoutes } from './stations.routes.js';

export async function stationsModule(fastify: FastifyInstance) {
  await fastify.register(stationRoutes);
}

export * from './interfaces/station.repository.interface.js';
export * from './repositories/station.repository.js';
