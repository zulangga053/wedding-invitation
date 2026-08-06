import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  superAdmin?: boolean;
}

/** Injects the authenticated Firebase user set by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    if (!request.user) {
      throw new Error('AuthenticatedUser unavailable — is AuthGuard applied?');
    }
    return request.user!;
  },
);

/** Injects the authenticated user's current tenant membership set by TenantGuard. */
export const CurrentMember = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Record<string, unknown> => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ member?: Record<string, unknown> }>();
    return request.member ?? {};
  },
);
