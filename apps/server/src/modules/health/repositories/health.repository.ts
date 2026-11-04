import { sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { valkey } from '../../../config/valkey.js';
import { IHealthRepository } from '../interfaces/health.interface.js';

export class HealthRepository implements IHealthRepository {
  constructor(
    private readonly database = db,
    private readonly cache = valkey
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

  async checkValkey(timeoutMs = 3000): Promise<boolean> {
    try {
      const valkeyPromise = this.cache.ping();
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Valkey Timeout')), timeoutMs)
      );
      const pong = await Promise.race([valkeyPromise, timeout]);
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  async checkRedis(timeoutMs = 3000): Promise<boolean> {
    return this.checkValkey(timeoutMs);
  }
}

export const healthRepository = new HealthRepository();
