import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth.routes.js';

export const authModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authRoutes);
};

export default authModule;
