import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

/**
 * Tenant isolation guard — verifies the authenticated user is a member of
 * `tenants/{tenantId}`. Super admins bypass. Apply at controller level after
 * the global AuthGuard on routes shaped `.../:tenantId/...`.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (user.superAdmin) return true;

    const tenantId = request.params.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Missing :tenantId route parameter');
    }

    const memberRef = this.firebase.firestore.doc(
      `tenants/${String(tenantId)}/members/${user.uid}`,
    );
    const member = await memberRef.get();
    if (!member.exists) {
      throw new ForbiddenException('Not a member of this tenant');
    }
    request.member = member.data();
    return true;
  }
}
