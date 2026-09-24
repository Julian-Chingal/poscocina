import { eq } from 'drizzle-orm';
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

  // If request has authenticated user, enforce tenant isolation
  const user = request.user as { venueId?: string; role?: string } | undefined;

  if (user && user.venueId && user.role !== 'super_admin') {
    if (resolvedExplicit && resolvedExplicit !== 'default' && resolvedExplicit !== user.venueId) {
      throw new ForbiddenError('No tienes autorización para acceder a los datos de otro local comercial.');
    }
    return user.venueId;
  }

  // If explicit ID given, is valid UUID, and not 'default', use it
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
