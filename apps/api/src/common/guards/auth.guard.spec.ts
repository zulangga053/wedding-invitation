import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { isPublic } from '../decorators';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

jest.mock('../decorators', () => ({
  isPublic: jest.fn(),
}));

const mockedIsPublic = isPublic as jest.MockedFunction<typeof isPublic>;

function makeCtx(handler: () => unknown, request: Record<string, unknown>) {
  return {
    getHandler: () => handler,
    getClass: () => class Mock {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as import('@nestjs/common').ExecutionContext;
}

describe('AuthGuard', () => {
  let verifyIdToken: jest.Mock;
  let guard: AuthGuard;

  beforeEach(() => {
    verifyIdToken = jest.fn();
    mockedIsPublic.mockReset();
    guard = new AuthGuard({
      auth: { verifyIdToken },
    } as unknown as FirebaseAdminService);
  });

  it('allows requests on public routes without verifying the token', async () => {
    mockedIsPublic.mockReturnValue(true);

    await expect(guard.canActivate(makeCtx(() => undefined, {}))).resolves.toBe(
      true,
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects when no Authorization header is present', async () => {
    mockedIsPublic.mockReturnValue(false);

    await expect(
      guard.canActivate(makeCtx(() => undefined, { headers: {} })),
    ).rejects.toThrow(new UnauthorizedException('Missing bearer token'));
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects when the Authorization header is not a Bearer token', async () => {
    mockedIsPublic.mockReturnValue(false);

    await expect(
      guard.canActivate(
        makeCtx(() => undefined, { headers: { authorization: 'Basic abc' } }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Missing bearer token'));
  });

  it('attaches the decoded user and allows a valid token', async () => {
    mockedIsPublic.mockReturnValue(false);
    verifyIdToken.mockResolvedValue({
      uid: 'uid-1',
      email: 'owner@momentia.app',
      superAdmin: true,
    });
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok-1' },
    };

    await expect(
      guard.canActivate(makeCtx(() => undefined, request)),
    ).resolves.toBe(true);
    expect(request.user).toEqual({
      uid: 'uid-1',
      email: 'owner@momentia.app',
      superAdmin: true,
    });
  });

  it('defaults superAdmin to false when the claim is absent', async () => {
    mockedIsPublic.mockReturnValue(false);
    verifyIdToken.mockResolvedValue({ uid: 'uid-2', email: 'x@y.app' });
    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok-2' },
    };

    await guard.canActivate(makeCtx(() => undefined, request));

    expect(request.user).toEqual({
      uid: 'uid-2',
      email: 'x@y.app',
      superAdmin: false,
    });
  });

  it('rejects an invalid or expired token', async () => {
    mockedIsPublic.mockReturnValue(false);
    verifyIdToken.mockRejectedValue(new Error('id-token-expired'));

    await expect(
      guard.canActivate(
        makeCtx(() => undefined, { headers: { authorization: 'Bearer bad' } }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });
});
