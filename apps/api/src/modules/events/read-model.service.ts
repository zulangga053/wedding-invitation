import { Injectable } from '@nestjs/common';
import type { Event } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const READ_MODEL_SERVICE = Symbol('READ_MODEL_SERVICE');

export interface InvitationReadModel {
  slug: string;
  eventId: string;
  tenantId: string;
  type: Event['type'];
  status: Event['status'];
  name: string;
  hosts: Event['hosts'];
  mainDate: string;
  language: Event['language'];
  themeId: string;
  hero: Event['hero'];
  seo: Event['seo'];
  music: Event['music'];
  stream: Event['stream'];
  publishedAt: string | null;
  updatedAt: string;
}

/**
 * Materialized read model (ADR-002): the public invitation page reads a SINGLE
 * `invitations/{slug}` document, so SSR stays fast and ISR/CDN caching applies.
 * Rebuilt on publish/update and revalidated in the web app via revalidateTag.
 */
@Injectable()
export class ReadModelService {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  async rebuild(event: Event): Promise<InvitationReadModel> {
    const snapshot: InvitationReadModel = {
      slug: event.slug,
      eventId: event.id,
      tenantId: event.tenantId,
      type: event.type,
      status: event.status,
      name: event.name,
      hosts: event.hosts,
      mainDate: event.mainDate,
      language: event.language,
      themeId: event.themeId,
      hero: event.hero,
      seo: event.seo,
      music: event.music ?? null,
      stream: event.stream ?? null,
      publishedAt: event.publishedAt ?? null,
      updatedAt: new Date().toISOString(),
    };
    await this.db.doc(`invitations/${event.slug}`).set(snapshot);
    return snapshot;
  }

  async remove(slug: string): Promise<void> {
    await this.db
      .doc(`invitations/${slug}`)
      .delete()
      .catch(() => undefined);
  }
}
