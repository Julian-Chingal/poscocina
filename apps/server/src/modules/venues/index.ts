import { FastifyPluginAsync } from 'fastify';
import { venuesRoutes } from './venues.routes.js';

export const venuesModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(venuesRoutes);
};

export default venuesModule;
