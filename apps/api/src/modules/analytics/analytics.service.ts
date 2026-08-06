import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  AnalyticsEventType,
  AnalyticsSummary,
  DailyStat,
} from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import {
  ANALYTICS_REPOSITORY,
  type AnalyticsEventEntry,
  type AnalyticsRepository,
} from './analytics.repository';

export interface ViewMeta {
  referrer?: string;
  device?: string;
  browser?: string;
  sessionId?: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly repository: AnalyticsRepository,
    private readonly resolver: PublicEventResolver,
  ) {}

  private async track(
    metric: 'views' | 'rsvp' | 'wishes' | 'giftConfirmations' | 'shares',
    slug: string,
    meta?: ViewMeta,
  ): Promise<void> {
    try {
      const { tenantId, eventId } = await this.resolver.resolve(slug);
      const entry: AnalyticsEventEntry = {
        type: metricToEventType(metric),
        tenantId,
        eventId,
        referrer: meta?.referrer,
        device: meta?.device,
        browser: meta?.browser,
        sessionId: meta?.sessionId,
        ts: new Date().toISOString(),
      };
      await this.repository.increment(tenantId, eventId, metric);
      await this.repository.recordEvent(entry);
    } catch (err) {
      // Tracking must never break the caller (fire-and-forget semantics).
      this.logger.warn(
        `analytics.track failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
    }
  }

  trackView(slug: string, meta: ViewMeta): Promise<void> {
    return this.track('views', slug, meta);
  }

  trackRsvp(slug: string): Promise<void> {
    return this.track('rsvp', slug);
  }

  trackWish(slug: string): Promise<void> {
    return this.track('wishes', slug);
  }

  trackGiftConfirm(slug: string): Promise<void> {
    return this.track('giftConfirmations', slug);
  }

  trackShare(slug: string): Promise<void> {
    return this.track('shares', slug);
  }

  async summary(
    tenantId: string,
    eventId: string,
    days = 30,
  ): Promise<AnalyticsSummary> {
    const to = today();
    const from = addDays(to, -(days - 1));
    const daily = await this.repository.daily(tenantId, eventId, from, to);
    const summary: AnalyticsSummary = {
      views: 0,
      rsvp: 0,
      wishes: 0,
      giftConfirmations: 0,
      shares: 0,
    };
    for (const stat of daily) {
      summary.views += stat.views ?? 0;
      summary.rsvp += stat.rsvp ?? 0;
      summary.wishes += stat.wishes ?? 0;
      summary.giftConfirmations += stat.giftConfirmations ?? 0;
      summary.shares += stat.shares ?? 0;
    }
    return summary;
  }

  daily(
    tenantId: string,
    eventId: string,
    from: string,
    to: string,
  ): Promise<DailyStat[]> {
    return this.repository.daily(tenantId, eventId, from, to);
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, amount: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}

function metricToEventType(metric: string): AnalyticsEventType {
  const map: Record<string, AnalyticsEventType> = {
    views: 'view',
    rsvp: 'rsvp',
    wishes: 'wish',
    giftConfirmations: 'giftConfirm',
    shares: 'share',
  };
  return map[metric] ?? 'view';
}
