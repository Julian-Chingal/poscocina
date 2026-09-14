import bcrypt from 'bcryptjs';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { redis } from '../config/redis.js';
import { auditService } from './audit.service.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import { CreateUserInput, UpdateUserInput } from '@poscocina/shared';

export class UsersService {
  async getRoles() {
    return await db.select().from(schema.roles).orderBy(desc(schema.roles.hierarchy));
  }

  async getVenueUsers(venueId: string) {
    return await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatarUrl: schema.users.avatarUrl,
        isActive: schema.users.isActive,
        createdAt: schema.users.createdAt,
        roleId: schema.users.roleId,
        roleName: schema.roles.name,
        roleLabel: schema.roles.label,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.venueId, venueId))
      .orderBy(desc(schema.users.createdAt));
  }

  async createUser(venueId: string, data: CreateUserInput, actorId?: string) {
    const pinHash = await bcrypt.hash(data.pin, 10);
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : null;

    if (normalizedEmail) {
      const [existing] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, normalizedEmail))
        .limit(1);

      if (existing) {
        throw new BadRequestError('Ya existe un usuario registrado con este correo electrónico.');
      }
    }

    const [newUser] = await db
      .insert(schema.users)
      .values({
        venueId,
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        pinHash,
        roleId: data.roleId,
        avatarUrl: data.avatarUrl || null,
        isActive: true,
      })
      .returning();

    await auditService.log({
      venueId,
      userId: actorId,
      action: 'USER_CREATED',
      entityType: 'user',
      entityId: newUser.id,
      payload: { name: newUser.name, roleId: newUser.roleId },
    });

    return newUser;
  }

  async updateUser(userId: string, data: UpdateUserInput, actorId?: string) {
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const updatePayload: Partial<typeof schema.users.$inferInsert> = {};

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.roleId !== undefined) updatePayload.roleId = data.roleId;
    if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.email !== undefined) {
      const normalized = data.email ? data.email.toLowerCase().trim() : null;
      if (normalized && normalized !== existing.email) {
        const [conflict] = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.email, normalized))
          .limit(1);
        if (conflict) {
          throw new BadRequestError('El correo electrónico ya se encuentra en uso por otro empleado.');
        }
      }
      updatePayload.email = normalized;
    }

    if (data.password) {
      updatePayload.passwordHash = await bcrypt.hash(data.password, 10);
      updatePayload.tokenVersion = (existing.tokenVersion || 1) + 1;
      await redis.del(`user_token_version:${userId}`);
    }

    const [updated] = await db
      .update(schema.users)
      .set(updatePayload)
      .where(eq(schema.users.id, userId))
      .returning();

    await auditService.log({
      venueId: existing.venueId,
      userId: actorId,
      action: 'USER_UPDATED',
      entityType: 'user',
      entityId: userId,
      payload: { changes: Object.keys(updatePayload) },
    });

    return updated;
  }

  async resetPin(userId: string, newPin: string, actorId?: string) {
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const pinHash = await bcrypt.hash(newPin, 10);

    const [updated] = await db
      .update(schema.users)
      .set({
        pinHash,
        tokenVersion: sql`${schema.users.tokenVersion} + 1`,
      })
      .where(eq(schema.users.id, userId))
      .returning();

    // Reset lockout and attempts in Redis
    await redis.del(`pin_lockout:${userId}`);
    await redis.del(`pin_attempts:${userId}`);
    await redis.del(`user_token_version:${userId}`);

    await auditService.log({
      venueId: existing.venueId,
      userId: actorId,
      action: 'USER_PIN_RESET',
      entityType: 'user',
      entityId: userId,
    });

    return { success: true, message: 'PIN actualizado exitosamente' };
  }

  async deleteUser(userId: string, actorId?: string) {
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    if (!existing) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Soft delete
    await db
      .update(schema.users)
      .set({
        isActive: false,
        tokenVersion: sql`${schema.users.tokenVersion} + 1`,
      })
      .where(eq(schema.users.id, userId));

    await redis.del(`user_token_version:${userId}`);
    await redis.del(`pin_lockout:${userId}`);

    await auditService.log({
      venueId: existing.venueId,
      userId: actorId,
      action: 'USER_DEACTIVATED',
      entityType: 'user',
      entityId: userId,
    });

    return { success: true };
  }
}

export const usersService = new UsersService();
