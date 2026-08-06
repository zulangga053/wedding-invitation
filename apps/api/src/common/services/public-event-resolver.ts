import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export interface ResolvedPublicEvent {
  tenantId: string;
  eventId: string;
  slug: string;
}

/**
 * Resolves a public invitation slug to its tenant/event ids using the
 * materialized read-model (ADR-002). Only published invitations resolve.
 */
@Injectable()
export class PublicEventResolver {
  constructor(private readonly firebase: FirebaseAdminService) {}

  async resolve(slug: string): Promise<ResolvedPublicEvent> {
    const snap = await this.firebase.firestore.doc(`invitations/${slug}`).get();
    if (!snap.exists) {
      throw new NotFoundException('Invitation not found');
    }
    const data = snap.data() as {
      tenantId?: string;
      eventId?: string;
      status?: string;
    };
    if (data.status !== 'published' || !data.tenantId || !data.eventId) {
      throw new NotFoundException('Invitation not found');
    }
    return { tenantId: data.tenantId, eventId: data.eventId, slug };
  }
}
