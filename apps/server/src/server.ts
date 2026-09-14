import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { socketPlugin } from './plugins/socket.plugin.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { tablesRoutes } from './routes/tables.routes.js';
import { productsRoutes } from './routes/products.routes.js';
import { ordersRoutes } from './routes/orders.routes.js';
import { venuesRoutes } from './routes/venues.routes.js';

export async function buildServer() {
  const server = Fastify({
    logger: true,
  });

  // CORS
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret-poscocina-2026',
  });

  // Real-time WebSocket plugin
  await server.register(socketPlugin);

  // Register Routes
  await server.register(healthRoutes);
  await server.register(authRoutes);
  await server.register(venuesRoutes);
  await server.register(tablesRoutes);
  await server.register(productsRoutes);
  await server.register(ordersRoutes);

  return server;
}
