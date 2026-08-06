import { Injectable } from '@nestjs/common';
import type { Rsvp } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const RSVP_REPOSITORY = Symbol('RSVP_REPOSITORY');

export interface RsvpPage {
  items: Rsvp[];
  nextCursor?: string;
}

export interface RsvpRepository {
  create(tenantId: string, eventId: string, rsvp: Rsvp): Promise<Rsvp>;
  list(
    tenantId: string,
    eventId: string,
    limit: number,
    cursor?: string,
  ): Promise<RsvpPage>;
}

@Injectable()
export class FirestoreRsvpRepository implements RsvpRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/rsvp`);
  }

  async create(tenantId: string, eventId: string, rsvp: Rsvp): Promise<Rsvp> {
    // Clean up undefined values before saving to Firestore
    const cleanRsvp = Object.fromEntries(
      Object.entries(rsvp).filter(([_, value]) => value !== undefined),
    );
    await this.col(tenantId, eventId).doc(rsvp.id).set(cleanRsvp);
    return rsvp;
  }

  async list(
    tenantId: string,
    eventId: string,
    limit: number,
    cursor?: string,
  ): Promise<RsvpPage> {
    let query: FirebaseFirestore.Query = this.col(tenantId, eventId);
    if (cursor) query = query.where('createdAt', '<', cursor);
    const snap = await query
      .orderBy('createdAt', 'desc')
      .limit(Math.min(limit, 200))
      .get();
    const items = snap.docs.map((doc) => doc.data() as Rsvp);
    const last = items[items.length - 1];
    return {
      items,
      nextCursor: items.length >= limit ? last?.createdAt : undefined,
    };
  }
}
