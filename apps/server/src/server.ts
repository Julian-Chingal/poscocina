import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { env } from './config/env.js';
import { authPlugin } from './plugins/auth.plugin.js';
import { socketPlugin } from './plugins/socket.plugin.js';
import { errorHandlerPlugin } from './plugins/error-handler.plugin.js';
// Domain Feature Modules (Vertical Slices)
import { healthModule } from './modules/health/index.js';
import { authModule } from './modules/auth/index.js';
import { billingModule } from './modules/billing/index.js';
import { hardwareModule } from './modules/hardware/index.js';
import { ordersModule } from './modules/orders/index.js';
import { tablesModule } from './modules/tables/index.js';
import { catalogModule } from './modules/catalog/index.js';
import { inventoryModule } from './modules/inventory/index.js';
import { reservationsModule } from './modules/reservations/index.js';
import { customersModule } from './modules/customers/index.js';
import { analyticsModule } from './modules/analytics/index.js';
import { venuesModule } from './modules/venues/index.js';

export async function buildServer() {
  const server = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  // 0. Centralized Error Handling
  await server.register(errorHandlerPlugin);

  // 1. Security Headers (Helmet)
  await server.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // 2. Global Rate Limiting
  await server.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // 3. CORS
  await server.register(cors, {
    origin: (origin, cb) => {
      if (!origin || env.CORS_ORIGIN.split(',').some((allowed) => origin.startsWith(allowed.trim()))) {
        cb(null, true);
        return;
      }
      cb(null, true);
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

  // 7. Register Domain Feature Modules
  await server.register(healthModule);
  await server.register(authModule);
  await server.register(venuesModule);
  await server.register(tablesModule);
  await server.register(catalogModule);
  await server.register(ordersModule);
  await server.register(inventoryModule);
  await server.register(billingModule);
  await server.register(analyticsModule);
  await server.register(hardwareModule);
  await server.register(customersModule);
  await server.register(reservationsModule);

  return server;
}
