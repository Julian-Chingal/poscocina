import { Redis } from 'ioredis';
import { env } from './env.js';

class ValkeyService {
  private client: Redis | null = null;

  getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(env.VALKEY_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 200, 2000);
          return delay;
        },
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        console.log('📦 Valkey client connected successfully');
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Valkey client error:', err.message);
      });
    }

    return this.client;
  }
}

export const valkeyService = new ValkeyService();
export const valkey = valkeyService.getClient();

// Backwards compatibility aliases
export const redisService = valkeyService;
export const redis = valkey;
