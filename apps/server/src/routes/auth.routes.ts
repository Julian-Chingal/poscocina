import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller.js';

export async function authRoutes(fastify: FastifyInstance) {
  // 1. Get users for PIN Pad terminal selection
  fastify.get('/api/auth/venue/:venueId/users', (request, reply) =>
    authController.getVenueUsers(request, reply)
  );

  // 2. Floor staff PIN login (Rate-limited to protect against brute force)
  fastify.post(
    '/api/auth/pin-login',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Demasiados intentos de autenticación. Espere 1 minuto.',
          }),
        },
      },
    },
    (request, reply) => authController.loginWithPin(request, reply)
  );

  // 3. Manager / Administrator email + password login
  fastify.post(
    '/api/auth/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Demasiados intentos de acceso fallidos. Espere 1 minuto.',
          }),
        },
      },
    },
    (request, reply) => authController.loginWithPassword(request, reply)
  );

  // 4. In-flight Manager PIN Override
  fastify.post('/api/auth/manager-override', (request, reply) =>
    authController.managerPinOverride(request, reply)
  );
}
