import { FastifyInstance } from 'fastify';
import { healthController } from './health.controller.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', (req, rep) => healthController.check(req, rep));
}
