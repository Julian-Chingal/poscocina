import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function venuesRoutes(fastify: FastifyInstance) {
  // 1. Get venue details including branding & settings
  fastify.get('/api/venues/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [venue] = await db.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!venue) {
      return reply.status(404).send({ error: 'Local no encontrado' });
    }

    return reply.send(venue);
  });

  // 2. Update venue branding & settings
  fastify.patch('/api/venues/:id/settings', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, address, timezone, settings } = request.body as {
      name?: string;
      address?: string;
      timezone?: string;
      settings?: Record<string, unknown>;
    };

    const [existing] = await db.select().from(schema.venues).where(eq(schema.venues.id, id)).limit(1);
    if (!existing) {
      return reply.status(404).send({ error: 'Local no encontrado' });
    }

    const mergedSettings = {
      ...((existing.settings as Record<string, unknown>) || {}),
      ...(settings || {}),
    };

    const updateFields: Record<string, unknown> = {
      settings: mergedSettings,
    };

    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    if (timezone) updateFields.timezone = timezone;

    const [updated] = await db
      .update(schema.venues)
      .set(updateFields)
      .where(eq(schema.venues.id, id))
      .returning();

    // Broadcast branding update in real time to all connected clients
    fastify.io.emit('venue:settings_updated', updated);

    return reply.send(updated);
  });
}
