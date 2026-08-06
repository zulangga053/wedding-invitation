import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Rsvp, RsvpCreateInput } from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  RSVP_REPOSITORY,
  type RsvpPage,
  type RsvpRepository,
} from './rsvp.repository';

export interface RsvpListQuery {
  limit?: number;
  cursor?: string;
}

@Injectable()
export class RsvpService {
  constructor(
    @Inject(RSVP_REPOSITORY) private readonly repository: RsvpRepository,
    private readonly resolver: PublicEventResolver,
    private readonly analytics: AnalyticsService,
  ) {}

  async createPublic(
    input: RsvpCreateInput,
  ): Promise<{ id: string; createdAt: string }> {
    const { tenantId, eventId } = await this.resolver.resolve(input.eventSlug);
    const createdAt = new Date().toISOString();
    const rsvp: Rsvp = {
      id: randomUUID(),
      tenantId,
      eventId,
      guestName: input.guestName,
      attendance: input.attendance,
      guestCount: input.guestCount,
      message: input.message,
      contact: input.contact,
      inviteCode: input.inviteCode,
      createdAt,
    };
    await this.repository.create(tenantId, eventId, rsvp);
    void this.analytics.trackRsvp(input.eventSlug);
    return { id: rsvp.id, createdAt };
  }

  list(
    tenantId: string,
    eventId: string,
    query: RsvpListQuery,
  ): Promise<RsvpPage> {
    return this.repository.list(
      tenantId,
      eventId,
      query.limit ?? 50,
      query.cursor,
    );
  }
}
