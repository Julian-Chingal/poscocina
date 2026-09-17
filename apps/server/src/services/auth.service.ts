import bcrypt from 'bcryptjs';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { redis } from '../config/redis.js';
import { auditService } from './audit.service.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/app-error.js';

export interface AuthenticatedUserPayload {
  id: string;
  venueId: string;
  name: string;
  email?: string | null;
  role: string;
  hierarchy: number;
  tokenVersion: number;
}

export class AuthService {
  async getVenueUsers(targetVenueId: string) {
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
      .where(and(eq(schema.users.venueId, targetVenueId), eq(schema.users.isActive, true)));

    return venueUsers;
  }

  async loginWithPin(
    venueId: string,
    userId: string,
    pin: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<AuthenticatedUserPayload> {
    // 1. Check if user is temporarily locked out due to excessive failed attempts
    const lockoutKey = `pin_lockout:${userId}`;
    const isLocked = await redis.get(lockoutKey);
    if (isLocked) {
      const ttl = await redis.ttl(lockoutKey);
      const minutesRemaining = Math.max(1, Math.ceil(ttl / 60));
      throw new ForbiddenError(
        `Terminal bloqueada por demasiados intentos fallidos. Espere ${minutesRemaining} minuto(s) o contacte a un administrador.`
      );
    }

    const [userWithRole] = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        venueId: schema.users.venueId,
        pinHash: schema.users.pinHash,
        tokenVersion: schema.users.tokenVersion,
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
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      });
      throw new NotFoundError('Usuario no encontrado o sin PIN configurado');
    }

    const isValid = await bcrypt.compare(pin, userWithRole.pinHash);
    if (!isValid) {
      // Increment failed attempts counter (TTL: 5 minutes)
      const attemptsKey = `pin_attempts:${userId}`;
      const attempts = await redis.incr(attemptsKey);
      if (attempts === 1) {
        await redis.expire(attemptsKey, 300);
      }

      if (attempts >= 5) {
        // Lockout for 5 minutes (300 seconds)
        await redis.set(lockoutKey, 'locked', 'EX', 300);
        await redis.del(attemptsKey);

        await auditService.log({
          venueId,
          userId,
          action: 'PIN_LOCKOUT_TRIGGERED',
          ipAddress: clientInfo?.ip,
          userAgent: clientInfo?.userAgent,
          payload: { attempts: 5, lockDurationSeconds: 300 },
        });

        throw new ForbiddenError('Ha superado el límite de 5 intentos. Terminal bloqueada durante 5 minutos.');
      }

      const remainingAttempts = 5 - attempts;

      await auditService.log({
        venueId,
        userId,
        action: 'PIN_LOGIN_FAILED_WRONG_PIN',
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        payload: { attempts, remainingAttempts },
      });

      throw new UnauthorizedError(`PIN incorrecto. Intentos restantes: ${remainingAttempts}`);
    }

    // Reset failed attempts on success
    await redis.del(`pin_attempts:${userId}`);
    await redis.del(lockoutKey);

    await auditService.log({
      venueId,
      userId: userWithRole.id,
      action: 'PIN_LOGIN_SUCCESS',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    return {
      id: userWithRole.id,
      venueId: userWithRole.venueId,
      name: userWithRole.name,
      role: userWithRole.roleName,
      hierarchy: userWithRole.roleHierarchy,
      tokenVersion: userWithRole.tokenVersion,
    };
  }

  async loginWithPassword(
    email: string,
    password: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<AuthenticatedUserPayload> {
    const normalizedEmail = email.toLowerCase().trim();

    const [userWithRole] = await db
      .select({
        id: schema.users.id,
        venueId: schema.users.venueId,
        name: schema.users.name,
        email: schema.users.email,
        passwordHash: schema.users.passwordHash,
        tokenVersion: schema.users.tokenVersion,
        roleName: schema.roles.name,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(and(eq(schema.users.email, normalizedEmail), eq(schema.users.isActive, true)))
      .limit(1);

    if (!userWithRole || !userWithRole.passwordHash) {
      await auditService.log({
        action: 'PASSWORD_LOGIN_FAILED_NOT_FOUND',
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        payload: { email: normalizedEmail },
      });
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    const isValid = await bcrypt.compare(password, userWithRole.passwordHash);
    if (!isValid) {
      await auditService.log({
        venueId: userWithRole.venueId,
        userId: userWithRole.id,
        action: 'PASSWORD_LOGIN_FAILED_WRONG_PASSWORD',
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      });
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    await auditService.log({
      venueId: userWithRole.venueId,
      userId: userWithRole.id,
      action: 'PASSWORD_LOGIN_SUCCESS',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    return {
      id: userWithRole.id,
      venueId: userWithRole.venueId,
      name: userWithRole.name,
      email: userWithRole.email,
      role: userWithRole.roleName,
      hierarchy: userWithRole.roleHierarchy,
      tokenVersion: userWithRole.tokenVersion,
    };
  }

  async invalidateUserSession(userId: string, venueId?: string) {
    // Increment tokenVersion in database to invalidate all existing JWTs for this user
    const [updatedUser] = await db
      .update(schema.users)
      .set({ tokenVersion: sql`${schema.users.tokenVersion} + 1` })
      .where(eq(schema.users.id, userId))
      .returning({ id: schema.users.id, tokenVersion: schema.users.tokenVersion });

    // Evict version cache from Redis
    await redis.del(`user_token_version:${userId}`);

    await auditService.log({
      venueId,
      userId,
      action: 'USER_SESSION_LOGOUT',
      payload: { newTokenVersion: updatedUser?.tokenVersion },
    });

    return { success: true };
  }

  async getUserProfile(userId: string) {
    const [user] = await db
      .select({
        id: schema.users.id,
        venueId: schema.users.venueId,
        name: schema.users.name,
        email: schema.users.email,
        avatarUrl: schema.users.avatarUrl,
        isActive: schema.users.isActive,
        roleName: schema.roles.name,
        roleLabel: schema.roles.label,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    return {
      id: user.id,
      venueId: user.venueId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.roleName,
      roleName: user.roleName,
      roleLabel: user.roleLabel,
      hierarchy: user.roleHierarchy,
      isActive: user.isActive,
    };
  }

  async verifyUserTokenVersion(userId: string, tokenVersion: number): Promise<boolean> {
    const cacheKey = `user_token_version:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached);
        if (typeof parsed === 'object' && parsed !== null) {
          if (!parsed.isActive) return false;
          return parsed.version === tokenVersion;
        }
      } catch {
        // Fallback for raw number string
      }
      return parseInt(cached, 10) === tokenVersion;
    }

    const [user] = await db
      .select({ tokenVersion: schema.users.tokenVersion, isActive: schema.users.isActive })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || !user.isActive) {
      await redis.set(cacheKey, JSON.stringify({ version: -1, isActive: false }), 'EX', 30);
      return false;
    }

    // Cache for 60 seconds
    await redis.set(cacheKey, JSON.stringify({ version: user.tokenVersion, isActive: true }), 'EX', 60);

    return user.tokenVersion === tokenVersion;
  }

  async verifyManagerPinOverride(
    venueId: string,
    managerPin: string,
    action: string,
    reason: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ) {
    const managers = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        pinHash: schema.users.pinHash,
        roleName: schema.roles.name,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .where(and(eq(schema.users.venueId, venueId), eq(schema.users.isActive, true)));

    for (const manager of managers) {
      if (manager.roleHierarchy >= 80 && manager.pinHash) {
        const isMatch = await bcrypt.compare(managerPin, manager.pinHash);
        if (isMatch) {
          await auditService.log({
            venueId,
            userId: manager.id,
            action: 'MANAGER_PIN_OVERRIDE_APPROVED',
            ipAddress: clientInfo?.ip,
            userAgent: clientInfo?.userAgent,
            payload: { requestedAction: action, reason, authorizedBy: manager.name },
          });

          return {
            authorized: true,
            managerId: manager.id,
            managerName: manager.name,
          };
        }
      }
    }

    await auditService.log({
      venueId,
      action: 'MANAGER_PIN_OVERRIDE_REJECTED',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      payload: { requestedAction: action, reason },
    });

    throw new ForbiddenError('PIN de gerente no válido o no autorizado');
  }
}

export const authService = new AuthService();
