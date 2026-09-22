import { FastifyPluginAsync } from 'fastify';
import { analyticsRoutes } from './analytics.routes.js';

export const analyticsModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(analyticsRoutes);
};

export default analyticsModule;
