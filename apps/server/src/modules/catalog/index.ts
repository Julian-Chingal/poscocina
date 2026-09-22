import { FastifyPluginAsync } from 'fastify';
import { catalogRoutes } from './catalog.routes.js';

export const catalogModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(catalogRoutes);
};

export default catalogModule;
