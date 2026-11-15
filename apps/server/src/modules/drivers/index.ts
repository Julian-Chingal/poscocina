import { FastifyPluginAsync } from 'fastify';
import { driversRoutes } from './drivers.routes.js';

export const driversModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(driversRoutes);
};

export default driversModule;
export * from './drivers.controller.js';
export * from './drivers.service.js';
export * from './drivers.routes.js';
