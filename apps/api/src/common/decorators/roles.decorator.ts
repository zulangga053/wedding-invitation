import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Requires the authenticated user to hold one of the given roles. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export function getRequiredRoles(context: {
  getHandler: () => object;
}): string[] {
  return Reflect.getMetadata(ROLES_KEY, context.getHandler()) ?? [];
}
