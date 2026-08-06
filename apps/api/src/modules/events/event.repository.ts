import { Injectable } from '@nestjs/common';
import type { Event, EventUpdateInput } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export class EventSlugTakenError extends Error {
  constructor(slug: string) {
    super(`Event slug already taken: ${slug}`);
    this.name = 'EventSlugTakenError';
  }
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export interface EventRepository {
  create(tenantId: string, event: Event): Promise<Event>;
  findById(tenantId: string, eventId: string): Promise<Event | null>;
  findBySlug(slug: string): Promise<Event | null>;
  list(tenantId: string): Promise<Event[]>;
  listPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]>;
  update(
    tenantId: string,
    eventId: string,
    input: EventUpdateInput,
  ): Promise<Event | null>;
  setStatus(
    tenantId: string,
    eventId: string,
    status: Event['status'],
  ): Promise<Event | null>;
  remove(tenantId: string, eventId: string): Promise<void>;
}

@Injectable()
export class FirestoreEventRepository implements EventRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private eventRef(tenantId: string, eventId: string) {
    return this.db.doc(`tenants/${tenantId}/events/${eventId}`);
  }

  async create(tenantId: string, event: Event): Promise<Event> {
    const eventRef = this.eventRef(tenantId, event.id);
    const slugRef = this.db.doc(`reserved-slugs/${event.slug}`);

    await this.db.runTransaction(async (tx) => {
      const existing = await tx.get(slugRef);
      if (existing.exists) {
        throw new EventSlugTakenError(event.slug);
      }
      tx.set(slugRef, {
        slug: event.slug,
        eventId: event.id,
        tenantId,
        kind: 'event',
        claimedAt: event.createdAt,
      });
      tx.set(eventRef, event);
    });

    return event;
  }

  async findById(tenantId: string, eventId: string): Promise<Event | null> {
    const snap = await this.eventRef(tenantId, eventId).get();
    return snap.exists ? (snap.data() as Event) : null;
  }

  async findBySlug(slug: string): Promise<Event | null> {
    const snap = await this.db.doc(`reserved-slugs/${slug}`).get();
    if (!snap.exists) return null;
    const data = snap.data() as {
      eventId?: string;
      tenantId?: string;
      kind?: string;
    };
    if (!data.eventId || !data.tenantId || data.kind !== 'event') return null;
    return this.findById(data.tenantId, data.eventId);
  }

  async list(tenantId: string): Promise<Event[]> {
    const snap = await this.db
      .collection(`tenants/${tenantId}/events`)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    return snap.docs.map((doc) => doc.data() as Event);
  }

  async listPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    const snap = await this.db
      .collection('invitations')
      .where('status', '==', 'published')
      .select('slug', 'updatedAt')
      .get();
    return snap.docs.map(
      (doc) => doc.data() as { slug: string; updatedAt: string },
    );
  }

  async update(
    tenantId: string,
    eventId: string,
    input: EventUpdateInput,
  ): Promise<Event | null> {
    const ref = this.eventRef(tenantId, eventId);
    const current = await ref.get();
    if (!current.exists) return null;

    await ref.update({ ...input, updatedAt: new Date().toISOString() });
    const updated = await ref.get();
    return updated.data() as Event;
  }

  async setStatus(
    tenantId: string,
    eventId: string,
    status: Event['status'],
  ): Promise<Event | null> {
    const ref = this.eventRef(tenantId, eventId);
    const current = await ref.get();
    if (!current.exists) return null;

    const patch: Partial<Event> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (status === 'published') patch.publishedAt = new Date().toISOString();

    await ref.update(patch);
    const updated = await ref.get();
    return updated.data() as Event;
  }

  async remove(tenantId: string, eventId: string): Promise<void> {
    const event = await this.findById(tenantId, eventId);
    if (event) {
      await this.db
        .doc(`reserved-slugs/${event.slug}`)
        .delete()
        .catch(() => undefined);
    }
    await this.eventRef(tenantId, eventId).delete();
  }
}
