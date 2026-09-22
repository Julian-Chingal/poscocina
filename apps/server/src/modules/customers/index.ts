import { FastifyPluginAsync } from 'fastify';
import { customersRoutes } from './customers.routes.js';

export const customersModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(customersRoutes);
};

export default customersModule;
