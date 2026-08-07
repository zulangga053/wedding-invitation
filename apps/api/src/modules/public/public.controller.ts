import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { slugSchema } from '@momentia/shared';
import { Public } from '../../common/decorators';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { GiftsService } from '../gifts/gifts.service';
import { EventsService } from '../events/events.service';
import { PublicInvitationsService } from './public-invitations.service';

@Controller('public/events')
export class PublicController {
  constructor(
    private readonly invitations: PublicInvitationsService,
    private readonly gifts: GiftsService,
    private readonly events: EventsService,
  ) {}

  /**
   * All published invitation slugs, consumed by the sitemap generator.
   * MUST be declared before `:slug` so `GET /public/events/slugs` is not
   * shadowed by the parameterized route.
   */
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 60, windowMs: 60_000 })
  @Get('slugs')
  slugs() {
    return this.events.listPublishedSlugs();
  }

  /** Full published invitation: read-model + enabled sections. */
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 120, windowMs: 60_000 })
  @Get(':slug')
  get(@Param('slug', new ZodPipe(slugSchema)) slug: string) {
    return this.invitations.getPublished(slug);
  }

  /** Public gift list for the gift section. */
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 120, windowMs: 60_000 })
  @Get(':slug/gifts')
  listGifts(@Param('slug', new ZodPipe(slugSchema)) slug: string) {
    return this.gifts.listPublic(slug);
  }
}
