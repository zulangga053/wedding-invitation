import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAdminService } from '../../database/firebase-admin.service';
import { isPublic, type AuthenticatedUser } from '../decorators';

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

/**
 * Global guard — verifies the Firebase ID token (Authorization: Bearer <token>)
 * and attaches the decoded user. Skipped on routes decorated with @Public().
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isPublic(context)) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const decoded = await this.firebase.auth.verifyIdToken(token);
      const user: AuthenticatedUser = {
        uid: decoded.uid,
        email: decoded.email,
        superAdmin: decoded.superAdmin === true,
      };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
