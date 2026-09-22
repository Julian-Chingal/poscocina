import { FastifyPluginAsync } from 'fastify';
import { reservationsRoutes } from './reservations.routes.js';

export const reservationsModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(reservationsRoutes);
};

export default reservationsModule;
