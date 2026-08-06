import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { ViewTrackInput } from '@momentia/shared';
import { ViewTrackSchema } from '@momentia/shared';
import { Public } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

const DailyQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
type DailyQuery = z.infer<typeof DailyQuerySchema>;

const SummaryQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});
type SummaryQuery = z.infer<typeof SummaryQuerySchema>;

@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 120, windowMs: 60_000 })
  @Post('public/events/:slug/views')
  async trackView(
    @Param('slug') slug: string,
    @Body(new ZodPipe(ViewTrackSchema)) input: ViewTrackInput,
  ) {
    await this.analytics.trackView(slug, {
      referrer: input.referrer,
      device: input.device,
      browser: input.browser,
    });
    return { ok: true };
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/analytics/summary')
  summary(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Query(new ZodPipe(SummaryQuerySchema)) query: SummaryQuery,
  ) {
    return this.analytics.summary(tenantId, eventId, query.days);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/analytics/daily')
  daily(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Query(new ZodPipe(DailyQuerySchema)) query: DailyQuery,
  ) {
    return this.analytics.daily(tenantId, eventId, query.from, query.to);
  }
}
