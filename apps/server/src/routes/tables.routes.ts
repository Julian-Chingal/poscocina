import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export async function tablesRoutes(fastify: FastifyInstance) {
  // Get all tables for a venue with current order info
  fastify.get('/api/venues/:venueId/tables', async (request, reply) => {
    const { venueId } = request.params as { venueId: string };

    const venueTables = await db
      .select({
        id: schema.tables.id,
        label: schema.tables.label,
        capacity: schema.tables.capacity,
        positionX: schema.tables.positionX,
        positionY: schema.tables.positionY,
        shape: schema.tables.shape,
        status: schema.tables.status,
        currentOrderId: schema.tables.currentOrderId,
      })
      .from(schema.tables)
      .innerJoin(schema.floorPlans, eq(schema.tables.floorPlanId, schema.floorPlans.id))
      .where(eq(schema.floorPlans.venueId, venueId));

    return reply.send(venueTables);
  });

  // Update table status
  fastify.patch('/api/tables/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: 'free' | 'occupied' | 'check_requested' | 'reserved' | 'blocked' };

    const [updated] = await db
      .update(schema.tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.tables.id, id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: 'Mesa no encontrada' });
    }

    // Broadcast table status change in real time
    fastify.io.emit('table:updated', updated);

    return reply.send(updated);
  });
}
