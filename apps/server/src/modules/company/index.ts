import { FastifyPluginAsync } from 'fastify';
import { companyRoutes } from './company.routes.js';

export const companyModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(companyRoutes);
};

export default companyModule;
