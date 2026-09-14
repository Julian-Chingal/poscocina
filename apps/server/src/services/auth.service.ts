import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { auditService } from './audit.service.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/app-error.js';

export interface AuthenticatedUserPayload {
  id: string;
  venueId: string;
  name: string;
  email?: string | null;
  role: string;
  hierarchy: number;
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
    const [userWithRole] = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        venueId: schema.users.venueId,
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
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      });
      throw new NotFoundError('Usuario no encontrado o sin PIN configurado');
    }

    const isValid = await bcrypt.compare(pin, userWithRole.pinHash);
    if (!isValid) {
      await auditService.log({
        venueId,
        userId,
        action: 'PIN_LOGIN_FAILED_WRONG_PIN',
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      });
      throw new UnauthorizedError('PIN incorrecto');
    }

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
    };
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
