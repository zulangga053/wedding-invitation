import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';
import { RATE_LIMIT_KEY } from './rate-limit.decorator';
import { RedisService } from './redis.service';

function makeContext(
  handler: (...args: unknown[]) => unknown,
  request: Record<string, unknown>,
) {
  return {
    getHandler: () => handler,
    getClass: () => class Mock {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as import('@nestjs/common').ExecutionContext;
}

describe('RateLimitGuard (in-memory path)', () => {
  let redis: jest.Mocked<Pick<RedisService, 'isEnabled' | 'incrAndExpire'>>;
  let guard: RateLimitGuard;

  beforeEach(() => {
    redis = { isEnabled: false, incrAndExpire: jest.fn() };
    guard = new RateLimitGuard(redis as any);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const handler = () => undefined;
  const request = () => ({
    ip: '1.2.3.4',
    path: '/public/events/z-a',
    baseUrl: '',
  });

  it('passes through when no rate-limit metadata is attached', async () => {
    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).resolves.toBe(true);
    expect(redis.incrAndExpire).not.toHaveBeenCalled();
  });

  it('allows requests under the limit', async () => {
    Reflect.defineMetadata(
      RATE_LIMIT_KEY,
      { limit: 2, windowMs: 60_000 },
      handler,
    );

    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).resolves.toBe(true);
  });

  it('rejects with 429 once the limit is exceeded', async () => {
    Reflect.defineMetadata(
      RATE_LIMIT_KEY,
      { limit: 2, windowMs: 60_000 },
      handler,
    );

    await guard.canActivate(makeContext(handler, request()));
    await guard.canActivate(makeContext(handler, request()));

    const error = await guard
      .canActivate(makeContext(handler, request()))
      .then(() => null)
      .catch((e) => e);
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('resets the window after windowMs elapses', async () => {
    Reflect.defineMetadata(
      RATE_LIMIT_KEY,
      { limit: 1, windowMs: 60_000 },
      handler,
    );

    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).rejects.toThrow(HttpException);

    jest.setSystemTime(new Date('2026-01-01T00:01:01.000Z'));

    await expect(
      guard.canActivate(makeContext(handler, request())),
    ).resolves.toBe(true);
  });

  it('keys different clients separately', async () => {
    Reflect.defineMetadata(
      RATE_LIMIT_KEY,
      { limit: 1, windowMs: 60_000 },
      handler,
    );

    await expect(
      guard.canActivate(
        makeContext(handler, { ip: '1.1.1.1', path: '/x', baseUrl: '' }),
      ),
    ).resolves.toBe(true);
    await expect(
      guard.canActivate(
        makeContext(handler, { ip: '2.2.2.2', path: '/x', baseUrl: '' }),
      ),
    ).resolves.toBe(true);
  });
});
