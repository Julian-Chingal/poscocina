import { FastifyPluginAsync } from 'fastify';
import { ordersRoutes } from './orders.routes.js';

export const ordersModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(ordersRoutes);
};

export default ordersModule;
