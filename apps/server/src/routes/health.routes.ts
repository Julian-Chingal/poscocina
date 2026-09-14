import { FastifyInstance } from 'fastify';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { sql } from 'drizzle-orm';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    let dbStatus = 'down';
    try {
      await db.execute(sql`SELECT 1`);
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'poscocina-server',
      version: '0.1.0',
      database: dbStatus,
    };
  });

  // Get default venue for demo / initial bootstrap
  fastify.get('/api/venues/first', async (_request, reply) => {
    const [firstVenue] = await db.select().from(schema.venues).limit(1);
    if (!firstVenue) {
      return reply.status(404).send({ error: 'No hay venues configurados' });
    }
    return reply.send(firstVenue);
  });
}
