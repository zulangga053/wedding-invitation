import { Injectable } from '@nestjs/common';
import type { Wish } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const WISH_REPOSITORY = Symbol('WISH_REPOSITORY');

export interface WishListFilters {
  limit?: number;
  cursor?: string;
  approvedOnly?: boolean;
}

export interface WishPage {
  items: Wish[];
  nextCursor?: string;
}

export interface WishRepository {
  create(tenantId: string, eventId: string, wish: Wish): Promise<Wish>;
  list(
    tenantId: string,
    eventId: string,
    filters: WishListFilters,
  ): Promise<WishPage>;
  findById(
    tenantId: string,
    eventId: string,
    wishId: string,
  ): Promise<Wish | null>;
  setApproved(
    tenantId: string,
    eventId: string,
    wishId: string,
    isApproved: boolean,
  ): Promise<Wish | null>;
  remove(tenantId: string, eventId: string, wishId: string): Promise<void>;
}

@Injectable()
export class FirestoreWishRepository implements WishRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/messages`);
  }

  private ref(tenantId: string, eventId: string, wishId: string) {
    return this.col(tenantId, eventId).doc(wishId);
  }

  async create(tenantId: string, eventId: string, wish: Wish): Promise<Wish> {
    await this.ref(tenantId, eventId, wish.id).set(wish);
    return wish;
  }

  async list(
    tenantId: string,
    eventId: string,
    filters: WishListFilters,
  ): Promise<WishPage> {
    let query: FirebaseFirestore.Query = this.col(tenantId, eventId);
    if (filters.approvedOnly) query = query.where('isApproved', '==', true);
    if (filters.cursor) query = query.where('createdAt', '<', filters.cursor);

    const limit = Math.min(filters.limit ?? 30, 100);
    const snap = await query.orderBy('createdAt', 'desc').limit(limit).get();
    const items = snap.docs.map((doc) => doc.data() as Wish);
    const last = items[items.length - 1];
    return {
      items,
      nextCursor: items.length >= limit ? last?.createdAt : undefined,
    };
  }

  async findById(
    tenantId: string,
    eventId: string,
    wishId: string,
  ): Promise<Wish | null> {
    const snap = await this.ref(tenantId, eventId, wishId).get();
    return snap.exists ? (snap.data() as Wish) : null;
  }

  async setApproved(
    tenantId: string,
    eventId: string,
    wishId: string,
    isApproved: boolean,
  ): Promise<Wish | null> {
    const current = await this.findById(tenantId, eventId, wishId);
    if (!current) return null;
    await this.ref(tenantId, eventId, wishId).update({ isApproved });
    return this.findById(tenantId, eventId, wishId);
  }

  async remove(
    tenantId: string,
    eventId: string,
    wishId: string,
  ): Promise<void> {
    await this.ref(tenantId, eventId, wishId).delete();
  }
}
