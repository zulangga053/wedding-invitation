import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Wish, WishCreateInput } from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  WISH_REPOSITORY,
  type WishListFilters,
  type WishPage,
  type WishRepository,
} from './wish.repository';

@Injectable()
export class WishesService {
  constructor(
    @Inject(WISH_REPOSITORY) private readonly repository: WishRepository,
    private readonly resolver: PublicEventResolver,
    private readonly analytics: AnalyticsService,
  ) {}

  async createPublic(
    input: WishCreateInput,
  ): Promise<{ id: string; createdAt: string }> {
    const { tenantId, eventId } = await this.resolver.resolve(input.eventSlug);
    const createdAt = new Date().toISOString();
    const wish: Wish = {
      id: randomUUID(),
      tenantId,
      eventId,
      name: input.name,
      message: input.message,
      avatarUrl: input.avatarUrl,
      isApproved: true,
      createdAt,
    };
    await this.repository.create(tenantId, eventId, wish);
    void this.analytics.trackWish(input.eventSlug);
    return { id: wish.id, createdAt };
  }

  async listPublic(slug: string, filters: WishListFilters): Promise<WishPage> {
    const { tenantId, eventId } = await this.resolver.resolve(slug);
    return this.repository.list(tenantId, eventId, {
      ...filters,
      approvedOnly: true,
    });
  }

  listAdmin(
    tenantId: string,
    eventId: string,
    filters: WishListFilters,
  ): Promise<WishPage> {
    return this.repository.list(tenantId, eventId, filters);
  }

  async moderate(
    tenantId: string,
    eventId: string,
    wishId: string,
    isApproved: boolean,
  ): Promise<Wish> {
    const updated = await this.repository.setApproved(
      tenantId,
      eventId,
      wishId,
      isApproved,
    );
    if (!updated) throw new NotFoundException(`Wish ${wishId} not found`);
    return updated;
  }

  async remove(
    tenantId: string,
    eventId: string,
    wishId: string,
  ): Promise<void> {
    await this.repository.remove(tenantId, eventId, wishId);
  }
}
