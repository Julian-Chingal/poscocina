import { FastifyPluginAsync } from 'fastify';
import { inventoryRoutes } from './inventory.routes.js';

export const inventoryModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(inventoryRoutes);
};

export default inventoryModule;
