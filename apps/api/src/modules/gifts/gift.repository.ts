import { Injectable } from '@nestjs/common';
import type { Gift, GiftConfirmation, GiftInput } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const GIFT_REPOSITORY = Symbol('GIFT_REPOSITORY');

export interface GiftRepository {
  list(tenantId: string, eventId: string): Promise<Gift[]>;
  findById(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<Gift | null>;
  create(tenantId: string, eventId: string, gift: Gift): Promise<Gift>;
  update(
    tenantId: string,
    eventId: string,
    giftId: string,
    input: GiftInput,
  ): Promise<Gift | null>;
  remove(tenantId: string, eventId: string, giftId: string): Promise<void>;
  addConfirmation(
    tenantId: string,
    eventId: string,
    giftId: string,
    confirmation: GiftConfirmation,
  ): Promise<GiftConfirmation>;
  confirmations(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<GiftConfirmation[]>;
}

@Injectable()
export class FirestoreGiftRepository implements GiftRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/gifts`);
  }

  private ref(tenantId: string, eventId: string, giftId: string) {
    return this.col(tenantId, eventId).doc(giftId);
  }

  private confirmCol(tenantId: string, eventId: string, giftId: string) {
    return this.ref(tenantId, eventId, giftId).collection('confirmations');
  }

  async list(tenantId: string, eventId: string): Promise<Gift[]> {
    const snap = await this.col(tenantId, eventId)
      .orderBy('order', 'asc')
      .get();
    return snap.docs.map((doc) => doc.data() as Gift);
  }

  async findById(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<Gift | null> {
    const snap = await this.ref(tenantId, eventId, giftId).get();
    return snap.exists ? (snap.data() as Gift) : null;
  }

  async create(tenantId: string, eventId: string, gift: Gift): Promise<Gift> {
    await this.ref(tenantId, eventId, gift.id).set(gift);
    return gift;
  }

  async update(
    tenantId: string,
    eventId: string,
    giftId: string,
    input: GiftInput,
  ): Promise<Gift | null> {
    const current = await this.findById(tenantId, eventId, giftId);
    if (!current) return null;
    await this.ref(tenantId, eventId, giftId).update({
      ...input,
      updatedAt: new Date().toISOString(),
    });
    return this.findById(tenantId, eventId, giftId);
  }

  async remove(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<void> {
    await this.ref(tenantId, eventId, giftId).delete();
  }

  async addConfirmation(
    tenantId: string,
    eventId: string,
    giftId: string,
    confirmation: GiftConfirmation,
  ): Promise<GiftConfirmation> {
    await this.confirmCol(tenantId, eventId, giftId)
      .doc(confirmation.id)
      .set(confirmation);
    return confirmation;
  }

  async confirmations(
    tenantId: string,
    eventId: string,
    giftId: string,
  ): Promise<GiftConfirmation[]> {
    const snap = await this.confirmCol(tenantId, eventId, giftId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    return snap.docs.map((doc) => doc.data() as GiftConfirmation);
  }
}
