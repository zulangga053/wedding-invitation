import type { DailyStat } from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { type AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let repo: jest.Mocked<AnalyticsRepository>;
  let resolver: jest.Mocked<Pick<PublicEventResolver, 'resolve'>>;
  let service: AnalyticsService;

  beforeEach(() => {
    repo = {
      increment: jest.fn().mockResolvedValue(undefined),
      recordEvent: jest.fn().mockResolvedValue(undefined),
      daily: jest.fn().mockResolvedValue([]),
    };
    resolver = {
      resolve: jest
        .fn()
        .mockResolvedValue({ tenantId: 't1', eventId: 'e1', slug: 'x' }),
    };
    service = new AnalyticsService(
      repo,
      resolver as unknown as PublicEventResolver,
    );
  });

  it('tracks a view and persists a daily counter + event', async () => {
    await service.trackView('zul-angga', { device: 'mobile' });
    expect(repo.increment).toHaveBeenCalledWith('t1', 'e1', 'views');
    expect(repo.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'view',
        eventId: 'e1',
        device: 'mobile',
      }),
    );
  });

  it('summarizes daily stats over a window', async () => {
    const daily: DailyStat[] = [
      {
        date: '2026-08-01',
        views: 10,
        rsvp: 2,
        wishes: 1,
        giftConfirmations: 0,
        shares: 1,
      },
      {
        date: '2026-08-02',
        views: 20,
        rsvp: 1,
        wishes: 3,
        giftConfirmations: 1,
        shares: 0,
      },
    ];
    repo.daily.mockResolvedValue(daily);

    const summary = await service.summary('t1', 'e1', 7);
    expect(summary).toEqual({
      views: 30,
      rsvp: 3,
      wishes: 4,
      giftConfirmations: 1,
      shares: 1,
    });
  });

  it('never throws when tracking fails (fire-and-forget)', async () => {
    resolver.resolve.mockRejectedValue(new Error('not found'));
    await expect(service.trackView('gone', {})).resolves.toBeUndefined();
  });
});
