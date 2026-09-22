import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { auditService } from '../utils/audit.service.js';

export interface AuthenticatedUser {
  sub: string;
  venueId: string;
  name: string;
  role: string;
  hierarchy: number;
  tokenVersion: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (allowedRoles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  // 1. Authenticate decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Encabezado de autorización Bearer ausente o malformado',
        });
      }

      const token = authHeader.substring(7);
      const decoded = await fastify.jwt.verify<AuthenticatedUser>(token);

      // Verify token version in database/cache for immediate session revocation
      const { authRepository } = await import('../modules/auth/repositories/auth.repository.js');
      const user = await authRepository.findUserWithRoleById(decoded.sub);
      const isVersionValid = user && user.isActive && user.tokenVersion === (decoded.tokenVersion || 1);
      if (!isVersionValid) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Sesión expirada o invalidada. Inicie sesión nuevamente.',
        });
      }

      request.user = decoded;
    } catch (err) {
      // Audit failed attempt
      auditService.log({
        action: 'AUTH_FAILED',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        payload: { error: (err as any).message },
      });

      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Token de autenticación expirado o inválido',
      });
    }
  });

  // 2. Role-based Access Control (RBAC) decorator
  fastify.decorate('requireRole', (allowedRoles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // First ensure user is authenticated
      if (!request.user) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Autenticación requerida para acceder a este recurso',
        });
      }

      // Check role
      if (!allowedRoles.includes(request.user.role)) {
        auditService.log({
          venueId: request.user.venueId,
          userId: request.user.sub,
          action: 'ACCESS_DENIED_ROLE',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          payload: {
            userRole: request.user.role,
            allowedRoles,
            endpoint: request.url,
          },
        });

        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: `Acceso restringido. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        });
      }
    };
  });
});
