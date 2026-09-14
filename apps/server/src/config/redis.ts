import { Redis } from 'ioredis';
import { env } from './env.js';

class RedisService {
  private client: Redis | null = null;

  getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 200, 2000);
          return delay;
        },
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        console.log('📦 Redis client connected successfully');
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Redis client error:', err.message);
      });
    }

    return this.client;
  }
}

export const redisService = new RedisService();
export const redis = redisService.getClient();
