import { FastifyPluginAsync } from 'fastify';
import { hardwareRoutes } from './hardware.routes.js';

export const hardwareModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(hardwareRoutes);
};

export default hardwareModule;
