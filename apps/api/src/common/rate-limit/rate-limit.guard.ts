import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { getRateLimitOptions } from './rate-limit.decorator';
import { RedisService } from './redis.service';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window rate limiter. Uses Redis when configured (shared across
 * instances); otherwise an in-memory map for single-instance dev.
 * Keyed by route + client IP.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly memory = new Map<string, MemoryEntry>();

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
      if (this.memory.size > 10_000) this.memory.clear();
      this.memory.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  }
}
