import { FastifyPluginAsync } from 'fastify';
import { billingRoutes } from './billing.routes.js';

export const billingModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(billingRoutes);
};

export default billingModule;
