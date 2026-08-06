import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators';
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

  /** Full published invitation: read-model + enabled sections. */
  @Public()
  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.invitations.getPublished(slug);
  }

  /** Public gift list for the gift section. */
  @Public()
  @Get(':slug/gifts')
  listGifts(@Param('slug') slug: string) {
    return this.gifts.listPublic(slug);
  }

  @Public()
  @Get('slugs')
  slugs() {
    // This is consumed by the sitemap generator
    return this.events.listPublishedSlugs();
  }
}
