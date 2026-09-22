import { FastifyPluginAsync } from 'fastify';
import { tablesRoutes } from './tables.routes.js';

export const tablesModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tablesRoutes);
};

export default tablesModule;
