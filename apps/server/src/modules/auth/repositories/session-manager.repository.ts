import { redis } from '../../../config/redis.js';
import { ISessionManager } from '../interfaces/auth.interface.js';

export class RedisSessionManager implements ISessionManager {
  async isLocked(userId: string): Promise<boolean> {
    const val = await redis.get(`pin_lockout:${userId}`);
    return Boolean(val);
  }

  async getLockoutTtl(userId: string): Promise<number> {
    return await redis.ttl(`pin_lockout:${userId}`);
  }

  async recordFailedAttempt(userId: string): Promise<number> {
    const attemptsKey = `pin_attempts:${userId}`;
    const attempts = await redis.incr(attemptsKey);
    if (attempts === 1) {
      await redis.expire(attemptsKey, 300); // 5 minutos de ventana
    }
    if (attempts >= 5) {
      await redis.setex(`pin_lockout:${userId}`, 300, 'locked');
      await redis.del(attemptsKey);
    }
    return attempts;
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await redis.del(`pin_attempts:${userId}`);
  }

  async blacklistToken(userId: string, ttlSeconds = 86400): Promise<void> {
    await redis.setex(`token_blacklist:${userId}`, ttlSeconds, 'revoked');
  }

  async lockTerminal(userId: string, ttlSeconds = 86400): Promise<void> {
    await redis.setex(`terminal_lock:${userId}`, ttlSeconds, 'locked');
  }

  async unlockTerminal(userId: string): Promise<void> {
    await redis.del(`terminal_lock:${userId}`);
  }

  async isTerminalLocked(userId: string): Promise<boolean> {
    const val = await redis.get(`terminal_lock:${userId}`);
    return Boolean(val);
  }
}

export const sessionManager = new RedisSessionManager();
