import { sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { redis } from '../../../config/redis.js';
import { IHealthRepository } from '../interfaces/health.interface.js';

export class HealthRepository implements IHealthRepository {
  constructor(
    private readonly database = db,
    private readonly cache = redis
  ) {}

  async checkDatabase(timeoutMs = 3000): Promise<boolean> {
    try {
      const dbPromise = this.database.execute(sql`SELECT 1`);
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), timeoutMs)
      );
      await Promise.race([dbPromise, timeout]);
      return true;
    } catch {
      return false;
    }
  }

  async checkRedis(timeoutMs = 3000): Promise<boolean> {
    try {
      const redisPromise = this.cache.ping();
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis Timeout')), timeoutMs)
      );
      const pong = await Promise.race([redisPromise, timeout]);
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}

export const healthRepository = new HealthRepository();
