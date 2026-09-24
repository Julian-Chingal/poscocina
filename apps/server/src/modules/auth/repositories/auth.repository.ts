import { eq, and, sql, notInArray, isNotNull } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { IAuthRepository } from '../interfaces/auth.interface.js';

export class AuthRepository implements IAuthRepository {
  constructor(private readonly database = db) {}

  async findVenueUsers(venueId?: string) {
    const isUuid = (str?: string): boolean =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (!venueId || !isUuid(venueId)) {
      return [];
    }

    return this.database
      .select({
        id: schema.users.id,
        venueId: schema.users.venueId,
        name: schema.users.name,
        roleId: schema.users.roleId,
        roleName: schema.roles.name,
        roleLabel: schema.roles.label,
        roleHierarchy: schema.roles.hierarchy,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .innerJoin(schema.venues, eq(schema.users.venueId, schema.venues.id))
      .where(
        and(
          eq(schema.users.venueId, venueId),
          eq(schema.users.isActive, true),
          eq(schema.venues.isActive, true),
          isNotNull(schema.users.pinHash),
          notInArray(schema.roles.name, ['manager', 'super_admin'])
        )
      );
  }

  async findUserWithRoleById(userId: string) {
    const [user] = await this.database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        venueId: schema.users.venueId,
        venueName: schema.venues.name,
        venueIsActive: schema.venues.isActive,
        email: schema.users.email,
        pinHash: schema.users.pinHash,
        tokenVersion: schema.users.tokenVersion,
        roleName: schema.roles.name,
        roleHierarchy: schema.roles.hierarchy,
        isActive: schema.users.isActive,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .innerJoin(schema.venues, eq(schema.users.venueId, schema.venues.id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    return user || null;
  }

  async findUserWithRoleByEmail(email: string) {
    const [user] = await this.database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        venueId: schema.users.venueId,
        venueName: schema.venues.name,
        venueIsActive: schema.venues.isActive,
        passwordHash: schema.users.passwordHash,
        tokenVersion: schema.users.tokenVersion,
        roleName: schema.roles.name,
        roleHierarchy: schema.roles.hierarchy,
        isActive: schema.users.isActive,
      })
      .from(schema.users)
      .innerJoin(schema.roles, eq(schema.users.roleId, schema.roles.id))
      .innerJoin(schema.venues, eq(schema.users.venueId, schema.venues.id))
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .limit(1);

    return user || null;
  }

  async findManagersByVenue(venueId: string) {
    return await this.database
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
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    await this.database
      .update(schema.users)
      .set({ tokenVersion: sql`${schema.users.tokenVersion} + 1` })
      .where(eq(schema.users.id, userId));
  }
}

export const authRepository = new AuthRepository();
