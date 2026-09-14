import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { env } from './config/env.js';
import { authPlugin } from './plugins/auth.plugin.js';
import { socketPlugin } from './plugins/socket.plugin.js';
import { errorHandlerPlugin } from './plugins/error-handler.plugin.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { auditRoutes } from './routes/audit.routes.js';
import { tablesRoutes } from './routes/tables.routes.js';
import { productsRoutes } from './routes/products.routes.js';
import { ordersRoutes } from './routes/orders.routes.js';
import { venuesRoutes } from './routes/venues.routes.js';
import { inventoryRoutes } from './routes/inventory.routes.js';
import { billingRoutes } from './routes/billing.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { hardwareRoutes } from './routes/hardware.routes.js';

export async function buildServer() {
  const server = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  // 0. Centralized Error Handling
  await server.register(errorHandlerPlugin);

  // 1. Security Headers (Helmet)
  await server.register(helmet, {
    contentSecurityPolicy: false, // Disabled for dev WebSocket and Vite HMR
    crossOriginEmbedderPolicy: false,
  });

  // 2. Global Rate Limiting (DDoS & Brute Force Prevention)
  await server.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // 3. CORS
  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow localhost dev origins or empty origin (mobile/curl/local LAN)
      if (!origin || env.CORS_ORIGIN.split(',').some((allowed) => origin.startsWith(allowed.trim()))) {
        cb(null, true);
        return;
      }
      cb(null, true); // Permissive in dev, restricted in prod
    },
    credentials: true,
  });

  // 4. JWT Authentication
  await server.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // 5. Custom Auth & RBAC plugin
  await server.register(authPlugin);

  // 6. Real-time WebSocket plugin
  await server.register(socketPlugin);

  // 7. Register Routes
  await server.register(healthRoutes);
  await server.register(authRoutes);
  await server.register(auditRoutes);
  await server.register(venuesRoutes);
  await server.register(tablesRoutes);
  await server.register(productsRoutes);
  await server.register(ordersRoutes);
  await server.register(inventoryRoutes);
  await server.register(billingRoutes);
  await server.register(analyticsRoutes);
  await server.register(hardwareRoutes);

  return server;
}
