import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  /** Max allowed requests within the window. */
  limit: number;
  /** Fixed window length in milliseconds. */
  windowMs: number;
}

/** Applies a fixed-window rate limit to a public route. */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

export function getRateLimitOptions(context: {
  getHandler: () => object;
  getClass: () => object;
}): RateLimitOptions | undefined {
  return (
    Reflect.getMetadata(RATE_LIMIT_KEY, context.getHandler()) ??
    Reflect.getMetadata(RATE_LIMIT_KEY, context.getClass())
  );
}
