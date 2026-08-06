import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { getRateLimitOptions } from './rate-limit.decorator';
import { RedisService } from './redis.service';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

/** Simple LRU cache to avoid unbounded memory growth in the guard. */
class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly cache: Map<K, V>;
  private readonly logger = new Logger(LRUCache.name);

  constructor(capacity = 10_000) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    const value = this.cache.get(key)!;
    // Move to end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict the least recently used item (the first one in map iteration)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        this.logger.warn(`Cache full, evicted key: ${String(firstKey)}`);
      }
    }
    this.cache.set(key, value);
  }
}

/**
 * Fixed-window rate limiter. Uses Redis when configured (shared across
 * instances); otherwise an in-memory LRU cache for single-instance dev.
 * Keyed by route + client IP.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly memory = new LRUCache<string, MemoryEntry>();

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = getRateLimitOptions(context);
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';
    const route = `${request.baseUrl}${request.path}`;
    const key = `${route}:${ip}`;

    const exceeded = await this.consume(key, options.limit, options.windowMs);
    if (exceeded) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    if (this.redis.isEnabled) {
      try {
        const count = await this.redis.incrAndExpire(key, windowMs);
        return count > limit;
      } catch {
        // Fallback to in-memory on Redis error
        return this.consumeInMemory(key, limit, windowMs);
      }
    }
    return this.consumeInMemory(key, limit, windowMs);
  }

  private consumeInMemory(
    key: string,
    limit: number,
    windowMs: number,
  ): boolean {
    const now = Date.now();
    const entry = this.memory.get(key);

    if (!entry || entry.resetAt <= now) {
      this.memory.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    entry.count += 1;
    this.memory.set(key, entry); // Update to mark as recently used
    return entry.count > limit;
  }
}
