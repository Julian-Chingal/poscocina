import fp from 'fastify-plugin';
import { healthRoutes } from './health.routes.js';

export const healthModule = fp(healthRoutes, {
  name: 'health-module',
});
