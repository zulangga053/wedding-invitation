import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  Gift,
  GiftConfirmInput,
  GiftConfirmation,
  GiftInput,
} from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { AuditService } from '../audit/audit.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { GIFT_REPOSITORY, type GiftRepository } from './gift.repository';
import type { AuthenticatedUser } from '../../common/decorators';

@Injectable()
export class GiftsService {
  constructor(
    @Inject(GIFT_REPOSITORY) private readonly repository: GiftRepository,
    private readonly resolver: PublicEventResolver,
    private readonly audit: AuditService,
    private readonly analytics: AnalyticsService,
  ) {}

  list(tenantId: string, eventId: string): Promise<Gift[]> {
    return this.repository.list(tenantId, eventId);
  }

  async listPublic(slug: string): Promise<Gift[]> {
    const { tenantId, eventId } = await this.resolver.resolve(slug);
    return this.repository.list(tenantId, eventId);
  }

  async getById(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<Gift> {
    const gift = await this.repository.findById(tenantId, eventId, giftId);
    if (!gift) throw new NotFoundException(`Gift ${giftId} not found`);
    return gift;
  }

  async create(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    input: GiftInput,
  ): Promise<Gift> {
    const now = new Date().toISOString();
    const gift: Gift = {
      id: randomUUID(),
      tenantId,
      eventId,
      type: input.type,
      label: input.label,
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      accountHolder: input.accountHolder,
      qrisImageUrl: input.qrisImageUrl,
      description: input.description,
      order: input.order ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.create(tenantId, eventId, gift);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gift.create',
      targetId: gift.id,
    });
    return gift;
  }

  async update(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    giftId: string,
    input: GiftInput,
  ): Promise<Gift> {
    const updated = await this.repository.update(
      tenantId,
      eventId,
      giftId,
      input,
    );
    if (!updated) throw new NotFoundException(`Gift ${giftId} not found`);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gift.update',
      targetId: giftId,
    });
    return updated;
  }

  async remove(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<void> {
    await this.repository.remove(tenantId, eventId, giftId);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gift.delete',
      targetId: giftId,
    });
  }

  async confirmPublic(
    input: GiftConfirmInput,
  ): Promise<{ id: string; createdAt: string }> {
    const { tenantId, eventId } = await this.resolver.resolve(input.eventSlug);
    const gift = await this.repository.findById(
      tenantId,
      eventId,
      input.giftId,
    );
    if (!gift) throw new NotFoundException(`Gift ${input.giftId} not found`);

    const createdAt = new Date().toISOString();
    const confirmation: GiftConfirmation = {
      id: randomUUID(),
      giftId: gift.id,
      tenantId,
      eventId,
      name: input.name,
      amount: input.amount,
      note: input.note,
      createdAt,
    };
    await this.repository.addConfirmation(
      tenantId,
      eventId,
      gift.id,
      confirmation,
    );
    void this.analytics.trackGiftConfirm(input.eventSlug);
    return { id: confirmation.id, createdAt };
  }

  confirmations(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<GiftConfirmation[]> {
    return this.repository.confirmations(tenantId, eventId, giftId);
  }
}
