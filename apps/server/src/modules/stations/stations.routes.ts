import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { stationController } from './stations.controller.js';

export async function stationRoutes(fastify: FastifyInstance) {
  fastify.register(async (authGroup) => {
    authGroup.addHook('onRequest', fastify.authenticate);

    const managerOnly = {
      preHandler: [fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN])],
    };

    authGroup.get('/api/stations', (req, rep) => stationController.getStations(req, rep));
    authGroup.get('/api/stations/:id', (req, rep) => stationController.getStationById(req, rep));
    authGroup.post('/api/stations', managerOnly, (req, rep) => stationController.createStation(req, rep));
    authGroup.put('/api/stations/:id', managerOnly, (req, rep) => stationController.updateStation(req, rep));
    authGroup.delete('/api/stations/:id', managerOnly, (req, rep) => stationController.deleteStation(req, rep));
  });
}
