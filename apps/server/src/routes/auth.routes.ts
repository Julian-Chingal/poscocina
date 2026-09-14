import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { PinLoginSchema, PasswordLoginSchema, ManagerPinOverrideSchema } from '@poscocina/shared';

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

  // 2. PIN Login (POS / Tablets)
  fastify.post('/api/auth/pin-login', async (request, reply) => {
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
      return reply.status(401).send({ error: 'Usuario no encontrado o no tiene PIN asignado' });
    }

    const isValid = await bcrypt.compare(pin, userWithRole.pinHash);
    if (!isValid) {
      return reply.status(401).send({ error: 'PIN incorrecto' });
    }

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
  });

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
        return reply.send({ authorized: true, managerId: mgr.id });
      }
    }

    return reply.status(403).send({ error: 'PIN de gerente no válido o no autorizado' });
  });
}
