import { NotFoundException } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import type { GiftInput } from '@momentia/shared';
import { GIFT_REPOSITORY } from './gift.repository';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { AuditService } from '../audit/audit.service';
import { AnalyticsService } from '../analytics/analytics.service';

describe('GiftsService', () => {
  let service: GiftsService;
  let repo: jest.Mocked<any>;
  let resolver: jest.Mocked<Pick<PublicEventResolver, 'resolve'>>;
  let audit: jest.Mocked<Pick<AuditService, 'log'>>;
  let analytics: jest.Mocked<Pick<AnalyticsService, 'trackGiftConfirm'>>;

  beforeEach(() => {
    repo = {
      list: jest.fn(),
      listPublic: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    resolver = { resolve: jest.fn() };
    audit = { log: jest.fn().mockResolvedValue(undefined) };
    analytics = { trackGiftConfirm: jest.fn() };
    service = new GiftsService(
      repo as any,
      resolver as any,
      audit as any,
      analytics as any,
    );
  });

  const input: GiftInput = {
    type: 'bank',
    label: 'Rekening BCA',
    bankName: 'BCA',
    accountNumber: '1234567890',
    accountHolder: 'Ari',
    description: 'Terima kasih',
    order: 1,
  };

  it('is constructed with the GIFT_REPOSITORY token', () => {
    expect(GIFT_REPOSITORY).toEqual(expect.any(Symbol));
    expect(service).toBeDefined();
  });
  it('listPublic resolves the event via resolver and delegates to repo', async () => {
    resolver.resolve.mockResolvedValue({
      tenantId: 't-1',
      eventId: 'e-1',
      slug: 'z-a',
    });
    const gifts = [{ id: 'g-1' }];
    repo.list.mockResolvedValue(gifts);

    await expect(service.listPublic('z-a')).resolves.toBe(gifts);
    expect(resolver.resolve).toHaveBeenCalledWith('z-a');
    expect(repo.list).toHaveBeenCalledWith('t-1', 'e-1');
  });

  it('listPublic throws NotFound when the event does not resolve', async () => {
    resolver.resolve.mockRejectedValue(new NotFoundException('Not found'));

    await expect(service.listPublic('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create creates a gift, persists it and audits', async () => {
    resolver.resolve.mockResolvedValue({
      tenantId: 't-1',
      eventId: 'e-1',
      slug: 'z-a',
    });
    repo.create.mockResolvedValue({ id: 'g-1' });

    const result = await service.create(
      { uid: 'uid-1', email: 'a@b.c' } as any,
      't-1',
      'e-1',
      input,
    );

    expect(repo.create).toHaveBeenCalledWith(
      't-1',
      'e-1',
      expect.objectContaining(input),
    );
    expect(audit.log).toHaveBeenCalled();
    expect(result.id).toEqual(expect.any(String));
  });
});
