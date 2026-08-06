import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  Member,
  MemberCreateInput,
  Tenant,
  TenantCreateInput,
  TenantUpdateInput,
} from '@momentia/shared';
import { AuditService } from '../audit/audit.service';
import {
  SlugTakenError,
  TENANT_REPOSITORY,
  type TenantRepository,
} from './tenant.repository';
import type { AuthenticatedUser } from '../../common/decorators';

const DEFAULT_PLAN = 'free' as const;
const DEFAULT_STATUS = 'trial' as const;

@Injectable()
export class TenantsService {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly repository: TenantRepository,
    private readonly audit: AuditService,
  ) {}

  async listForUser(user: AuthenticatedUser): Promise<Tenant[]> {
    return this.repository.listForUser(user.uid);
  }

  async create(
    user: AuthenticatedUser,
    input: TenantCreateInput,
  ): Promise<Tenant> {
    const now = new Date().toISOString();
    const tenant: Tenant = {
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      ownerUid: user.uid,
      plan: DEFAULT_PLAN,
      status: DEFAULT_STATUS,
      trialEndsAt: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      settings: { branding: {}, features: [] },
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.repository.create(tenant);
    } catch (err) {
      if (err instanceof SlugTakenError) {
        throw new ConflictException(`Slug "${input.slug}" is already taken`);
      }
      throw err;
    }

    const owner: Member = {
      uid: user.uid,
      tenantId: tenant.id,
      role: 'owner',
      email: user.email,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.addMember(tenant.id, owner);

    await this.audit.log({
      tenantId: tenant.id,
      actorUid: user.uid,
      action: 'tenant.create',
      targetId: tenant.id,
    });

    return tenant;
  }

  async getById(id: string): Promise<Tenant> {
    const tenant = await this.repository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async update(id: string, input: TenantUpdateInput): Promise<Tenant> {
    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundException(`Tenant ${id} not found`);
    return updated;
  }

  async deactivate(id: string, user: AuthenticatedUser): Promise<Tenant> {
    const updated = await this.repository.setStatus(id, 'suspended');
    if (!updated) throw new NotFoundException(`Tenant ${id} not found`);
    await this.audit.log({
      tenantId: id,
      actorUid: user.uid,
      action: 'tenant.deactivate',
      targetId: id,
    });
    return updated;
  }

  listAll(limit = 100): Promise<Tenant[]> {
    return this.repository.listAll(limit);
  }

  async setStatus(id: string, status: Tenant['status']): Promise<Tenant> {
    const updated = await this.repository.setStatus(id, status);
    if (!updated) throw new NotFoundException(`Tenant ${id} not found`);
    return updated;
  }

  async addMember(
    user: AuthenticatedUser,
    tenantId: string,
    input: MemberCreateInput,
    currentMember: { role?: string },
  ): Promise<Member> {
    if (currentMember.role !== 'owner' && !user.superAdmin) {
      throw new ForbiddenException('Only the tenant owner can add members');
    }
    const now = new Date().toISOString();
    const member: Member = {
      uid: input.uid,
      tenantId,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.addMember(tenantId, member);
    return member;
  }
}
