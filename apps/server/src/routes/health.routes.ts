import { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { redis } from '../config/redis.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    let dbStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';

    try {
      const dbPromise = db.execute(sql`SELECT 1`);
      const dbTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 3000)
      );
      await Promise.race([dbPromise, dbTimeout]);
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    try {
      const redisPromise = redis.ping();
      const redisTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis Timeout')), 3000)
      );
      const pong = await Promise.race([redisPromise, redisTimeout]);
      redisStatus = pong === 'PONG' ? 'up' : 'down';
    } catch {
      redisStatus = 'down';
    }

    const isHealthy = dbStatus === 'up' && redisStatus === 'up';

    const payload = {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'poscocina-server',
      version: '0.1.0',
      database: dbStatus,
      redis: redisStatus,
    };

    if (!isHealthy) {
      return reply.status(503).send(payload);
    }

    return reply.status(200).send(payload);
  });
}
