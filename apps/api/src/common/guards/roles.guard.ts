import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { getRequiredRoles } from '../decorators/roles.decorator';

/**
 * Enforces @Roles(...) metadata. Super admins satisfy every role.
 * Apply at controller level after AuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = getRequiredRoles(context);
    if (required.length === 0) return true;

    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.superAdmin) return true;
    if (required.includes('superAdmin')) {
      throw new ForbiddenException('Super administrator access required');
    }
    return true;
  }
}
