import { eq, and } from 'drizzle-orm';
import { FastifyRequest } from 'fastify';
import { ForbiddenError, NotFoundError } from '../errors/app-error.js';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

const isUuid = (str?: string): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export async function resolveVenueId(request: FastifyRequest, explicitVenueId?: string): Promise<string> {
  const queryVenueId = (request.query as any)?.venueId;
  const headerVenueId = request.headers['x-venue-id'] as string;
  const resolvedExplicit = explicitVenueId || queryVenueId || headerVenueId;

  // If request has authenticated user, enforce tenant/venue isolation
  const user = request.user as {
    venueId?: string;
    companyId?: string;
    allVenuesAccess?: boolean;
    role?: string;
  } | undefined;

  if (user) {
    // If user has multi-venue access (or super_admin)
    if (user.role === 'super_admin' || user.allVenuesAccess) {
      if (resolvedExplicit && resolvedExplicit !== 'default' && isUuid(resolvedExplicit)) {
        // If companyId is known, verify venue belongs to this company
        if (user.companyId && user.role !== 'super_admin') {
          const [venue] = await db
            .select({ id: schema.venues.id })
            .from(schema.venues)
            .where(and(eq(schema.venues.id, resolvedExplicit), eq(schema.venues.companyId, user.companyId)))
            .limit(1);

          if (!venue) {
            throw new ForbiddenError('No tienes autorización para acceder a una sede de otra empresa.');
          }
        }
        return resolvedExplicit;
      }
      return user.venueId || 'default';
    }

    // Standard user locked to single venue
    if (user.venueId) {
      if (resolvedExplicit && resolvedExplicit !== 'default' && resolvedExplicit !== user.venueId) {
        throw new ForbiddenError('No tienes autorización para acceder a los datos de otra sede.');
      }
      return user.venueId;
    }
  }

  // If unauthenticated but explicit ID given, is valid UUID, and not 'default'
  if (resolvedExplicit && resolvedExplicit !== 'default' && isUuid(resolvedExplicit)) {
    return resolvedExplicit;
  }

  // Fallback: prefer venue that actually has registered active users
  const [userWithVenue] = await db
    .select({ venueId: schema.users.venueId })
    .from(schema.users)
    .where(eq(schema.users.isActive, true))
    .limit(1);

  if (userWithVenue?.venueId) {
    return userWithVenue.venueId;
  }

  // Otherwise fallback to primary venue in database
  const [firstVenue] = await db.select({ id: schema.venues.id }).from(schema.venues).limit(1);
  if (!firstVenue) {
    throw new NotFoundError('No se encontró ningún local registrado en el sistema.');
  }
  return firstVenue.id;
}
