import { FastifyPluginAsync } from 'fastify';
import { whatsAppRoutes } from './whatsapp.routes.js';

export const whatsappModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(whatsAppRoutes);
};

export default whatsappModule;
