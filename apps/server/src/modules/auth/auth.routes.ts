import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';

export async function authRoutes(fastify: FastifyInstance) {
  // 1. Get users for PIN Pad terminal (legacy / fallback)
  fastify.get('/api/auth/venue/:venueId/users', (req, rep) => authController.getVenueUsers(req, rep));

  // 2. Operational staff Document (Cédula) + PIN login (Rate-limited)
  fastify.post(
    '/api/auth/login-document',
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Demasiados intentos de autenticación. Espere 1 minuto.',
          }),
        },
      },
    },
    (req, rep) => authController.loginWithDocument(req, rep)
  );

  // 3. Selection of company/venue when a document belongs to multiple restaurants
  fastify.post(
    '/api/auth/select-context',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Demasiadas solicitudes. Espere 1 minuto.',
          }),
        },
      },
    },
    (req, rep) => authController.selectAuthContext(req, rep)
  );

  // 4. Floor staff PIN login (Rate-limited)
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
    (req, rep) => authController.loginWithPin(req, rep)
  );

  // 5. Manager email + password login
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
    (req, rep) => authController.loginWithPassword(req, rep)
  );

  // 6. In-flight Manager PIN Override
  fastify.post('/api/auth/manager-override', (req, rep) => authController.managerPinOverride(req, rep));

  // 7. Current authenticated user profile
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, (req, rep) => authController.getMe(req, rep));

  // 8. Lock terminal session
  fastify.post('/api/auth/terminal/lock', { preHandler: [fastify.authenticate] }, (req, rep) => authController.lockTerminal(req, rep));

  // 9. Logout
  fastify.post('/api/auth/logout', { preHandler: [fastify.authenticate] }, (req, rep) => authController.logout(req, rep));
}
