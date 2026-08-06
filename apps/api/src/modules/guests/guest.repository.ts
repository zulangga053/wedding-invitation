import { Injectable } from '@nestjs/common';
import type { Guest } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const GUEST_REPOSITORY = Symbol('GUEST_REPOSITORY');

export interface GuestFilters {
  attendance?: string;
  search?: string;
  group?: string;
  limit?: number;
  cursor?: string;
}

export interface GuestPage {
  items: Guest[];
  nextCursor?: string;
}

export interface GuestPatch {
  name?: string;
  category?: string;
  side?: string;
  phone?: string;
  group?: string;
  tags?: string[];
  notes?: string;
  checkIn?: { status: boolean; at: string | null; by?: string };
  attendance?: Guest['attendance'];
}

export interface GuestRepository {
  list(
    tenantId: string,
    eventId: string,
    filters: GuestFilters,
  ): Promise<GuestPage>;
  findById(
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<Guest | null>;
  create(tenantId: string, eventId: string, guest: Guest): Promise<Guest>;
  update(
    tenantId: string,
    eventId: string,
    guestId: string,
    patch: GuestPatch,
  ): Promise<Guest | null>;
  remove(tenantId: string, eventId: string, guestId: string): Promise<void>;
  bulkCreate(
    tenantId: string,
    eventId: string,
    guests: Guest[],
  ): Promise<number>;
}

@Injectable()
export class FirestoreGuestRepository implements GuestRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/guests`);
  }

  private ref(tenantId: string, eventId: string, guestId: string) {
    return this.col(tenantId, eventId).doc(guestId);
  }

  async list(
    tenantId: string,
    eventId: string,
    filters: GuestFilters,
  ): Promise<GuestPage> {
    let query: FirebaseFirestore.Query = this.col(tenantId, eventId);

    if (filters.attendance) {
      query = query.where('attendance', '==', filters.attendance);
    }
    if (filters.group) {
      query = query.where('group', '==', filters.group);
    }
    if (filters.search) {
      const start = filters.search.toLowerCase();
      const end = start.replace(/.$/, (c) =>
        String.fromCharCode(c.charCodeAt(0) + 1),
      );
      query = query
        .where('searchName', '>=', start)
        .where('searchName', '<', end);
    }
    if (filters.cursor) {
      query = query.where('createdAt', '<', filters.cursor);
    }

    query = query
      .orderBy('createdAt', 'desc')
      .limit(Math.min(filters.limit ?? 50, 200));
    const snap = await query.get();

    const items = snap.docs.map((doc) => doc.data() as Guest);
    const last = items[items.length - 1];
    return {
      items,
      nextCursor:
        items.length > 0 && items.length >= (filters.limit ?? 50)
          ? last?.createdAt
          : undefined,
    };
  }

  async findById(
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<Guest | null> {
    const snap = await this.ref(tenantId, eventId, guestId).get();
    return snap.exists ? (snap.data() as Guest) : null;
  }

  async create(
    tenantId: string,
    eventId: string,
    guest: Guest,
  ): Promise<Guest> {
    await this.ref(tenantId, eventId, guest.id).set({
      ...guest,
      searchName: guest.name.toLowerCase(),
    });
    return guest;
  }

  async update(
    tenantId: string,
    eventId: string,
    guestId: string,
    patch: GuestPatch,
  ): Promise<Guest | null> {
    const current = await this.findById(tenantId, eventId, guestId);
    if (!current) return null;

    const next: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) next[key] = value;
    }
    if (patch.name !== undefined) {
      next['searchName'] = patch.name.toLowerCase();
    }
    await this.ref(tenantId, eventId, guestId).update(next);
    return this.findById(tenantId, eventId, guestId);
  }

  async remove(
    tenantId: string,
    eventId: string,
    guestId: string,
  ): Promise<void> {
    await this.ref(tenantId, eventId, guestId).delete();
  }

  async bulkCreate(
    tenantId: string,
    eventId: string,
    guests: Guest[],
  ): Promise<number> {
    const batch = this.db.batch();
    guests.forEach((guest) => {
      batch.set(this.ref(tenantId, eventId, guest.id), {
        ...guest,
        searchName: guest.name.toLowerCase(),
      });
    });
    await batch.commit();
    return guests.length;
  }
}
