import { FastifyPluginAsync } from 'fastify';
import { saasSubscriptionRoutes } from './saas-subscription.routes.js';

export const saasSubscriptionsModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(saasSubscriptionRoutes);
};

export default saasSubscriptionsModule;
