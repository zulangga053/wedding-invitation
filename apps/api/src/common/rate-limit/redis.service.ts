import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Thin Redis wrapper used for distributed rate limiting.
 * Falls back to a no-op when REDIS_URL is not configured; the guard then uses
 * its in-memory store. Best-effort — errors degrade to the memory path.
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  get isEnabled(): boolean {
    return Boolean(process.env.REDIS_URL);
  }

  private getRedis(): Redis {
    if (!this.client) {
      this.client = new Redis(
        process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
        {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        },
      );
    }
    return this.client;
  }

  /** INCR + EXPIRE (set only on first increment) — returns the current count. */
  async incrAndExpire(key: string, windowMs: number): Promise<number> {
    const redis = this.getRedis();
    if (redis.status !== 'ready') {
      await redis.connect();
    }
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, Math.max(1, Math.ceil(windowMs / 1000)));
    }
    return count;
  }
}
