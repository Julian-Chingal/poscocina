import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { PinLoginSchema, ManagerPinOverrideSchema } from '@poscocina/shared';
import { auditService } from '../services/audit.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  // 1. Get users list for a venue (for quick PIN login grid)
  fastify.get('/api/auth/venue/:venueId/users', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const venueUsers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        roleId: schema.users.roleId,
        roleName: schema.roles.name,
        roleLabel: schema.roles.label,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(and(eq(schema.users.venueId, venueId), eq(schema.users.isActive, true)));

    return reply.send(venueUsers);
  });

  // 2. PIN Login (POS / Tablets) with Rate Limiting & Audit Trail
  fastify.post(
    '/api/auth/pin-login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Demasiados intentos fallidos de autenticación. Espere 1 minuto.',
          }),
        },
      },
    },
    async (request, reply) => {
      const parse = PinLoginSchema.safeParse(request.body);
      if (!parse.success) {
        return reply.status(400).send({ error: 'Datos inválidos', details: parse.error.issues });
      }

      const { venueId, userId, pin } = parse.data;

      const [userWithRole] = await db
        .select({
          id: schema.users.id,
          venueId: schema.users.venueId,
          name: schema.users.name,
          pinHash: schema.users.pinHash,
          roleName: schema.roles.name,
          roleHierarchy: schema.roles.hierarchy,
        })
        .from(schema.users)
        .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
        .where(and(eq(schema.users.id, userId), eq(schema.users.venueId, venueId), eq(schema.users.isActive, true)))
        .limit(1);

      if (!userWithRole || !userWithRole.pinHash) {
        await auditService.log({
          venueId,
          userId,
          action: 'PIN_LOGIN_FAILED_USER_NOT_FOUND',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
        return reply.status(401).send({ error: 'Usuario no encontrado o sin credenciales' });
      }

      const isValid = await bcrypt.compare(pin, userWithRole.pinHash);
      if (!isValid) {
        await auditService.log({
          venueId,
          userId,
          action: 'PIN_LOGIN_FAILED_WRONG_PIN',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
        return reply.status(401).send({ error: 'PIN incorrecto' });
      }

      // Successful login audit
      await auditService.log({
        venueId,
        userId: userWithRole.id,
        action: 'PIN_LOGIN_SUCCESS',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      // Generate JWT
      const token = fastify.jwt.sign({
        sub: userWithRole.id,
        venueId: userWithRole.venueId,
        name: userWithRole.name,
        role: userWithRole.roleName,
        hierarchy: userWithRole.roleHierarchy,
      });

      return reply.send({
        token,
        user: {
          id: userWithRole.id,
          name: userWithRole.name,
          role: userWithRole.roleName,
          hierarchy: userWithRole.roleHierarchy,
        },
      });
    }
  );

  // 3. Manager PIN verification for sensitive actions
  fastify.post('/api/auth/verify-manager-pin', async (request, reply) => {
    const parse = ManagerPinOverrideSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parse.error.issues });
    }

    const { venueId, managerPin } = parse.data;

    const managers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        pinHash: schema.users.pinHash,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(
        and(
          eq(schema.users.venueId, venueId),
          eq(schema.users.isActive, true),
          eq(schema.roles.hierarchy, 2) // Manager hierarchy level
        )
      );

    for (const mgr of managers) {
      if (mgr.pinHash && (await bcrypt.compare(managerPin, mgr.pinHash))) {
        await auditService.log({
          venueId,
          userId: mgr.id,
          action: 'MANAGER_PIN_OVERRIDE_APPROVED',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
        return reply.send({ authorized: true, managerId: mgr.id });
      }
    }

    await auditService.log({
      venueId,
      action: 'MANAGER_PIN_OVERRIDE_REJECTED',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    return reply.status(403).send({ error: 'PIN de gerente no válido o no autorizado' });
  });
}
