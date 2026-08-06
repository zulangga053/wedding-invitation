import { ConflictException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { SlugTakenError, type TenantRepository } from './tenant.repository';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  const user = { uid: 'uid-1', email: 'owner@momentia.app' };
  let repo: jest.Mocked<TenantRepository>;
  let audit: jest.Mocked<Pick<AuditService, 'log'>>;
  let service: TenantsService;

  beforeEach(() => {
    repo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      listForUser: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn(),
      deactivate: jest.fn(),
      setStatus: jest.fn(),
      addMember: jest.fn(),
    } as jest.Mocked<TenantRepository>;

    audit = { log: jest.fn().mockResolvedValue(undefined) };
    service = new TenantsService(repo, audit as unknown as AuditService);
  });

  it('creates a tenant owned by the caller and adds the owner member', async () => {
    repo.create.mockImplementation(async (tenant) => tenant);

    const tenant = await service.create(user, {
      name: 'Zul & Angga',
      slug: 'zul-angga',
    });

    expect(tenant.ownerUid).toBe('uid-1');
    expect(tenant.plan).toBe('free');
    expect(tenant.status).toBe('trial');
    expect(tenant.slug).toBe('zul-angga');
    expect(repo.addMember).toHaveBeenCalledWith(
      tenant.id,
      expect.objectContaining({ uid: 'uid-1', role: 'owner' }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'tenant.create' }),
    );
  });

  it('throws ConflictException when the slug is taken', async () => {
    repo.create.mockRejectedValue(new SlugTakenError('zul-angga'));

    await expect(
      service.create(user, { name: 'X', slug: 'zul-angga' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.addMember).not.toHaveBeenCalled();
  });

  it('lists tenants the user belongs to', async () => {
    repo.listForUser.mockResolvedValue([]);
    await expect(service.listForUser(user)).resolves.toEqual([]);
  });
});
