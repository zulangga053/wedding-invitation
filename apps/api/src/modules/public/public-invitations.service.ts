import { Injectable, NotFoundException } from '@nestjs/common';
import type { Section } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';
import type { InvitationReadModel } from '../events/read-model.service';

export interface PublicInvitationPayload {
  invitation: InvitationReadModel;
  sections: Section[];
}

/**
 * Serves the published invitation for the public page (SSR-friendly):
 * the materialized read-model (ADR-002) plus enabled page-builder sections.
 */
@Injectable()
export class PublicInvitationsService {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  async getPublished(slug: string): Promise<PublicInvitationPayload> {
    const invitationSnap = await this.db.doc(`invitations/${slug}`).get();
    if (!invitationSnap.exists) {
      throw new NotFoundException('Invitation not found');
    }
    const invitation = invitationSnap.data() as InvitationReadModel;
    if (
      invitation.status !== 'published' ||
      !invitation.tenantId ||
      !invitation.eventId
    ) {
      throw new NotFoundException('Invitation not found');
    }

    const sectionsSnap = await this.db
      .collection(
        `tenants/${invitation.tenantId}/events/${invitation.eventId}/sections`,
      )
      .orderBy('order', 'asc')
      .get();
    const sections = sectionsSnap.docs
      .map((doc) => doc.data() as Section)
      .filter((section) => section.enabled);

    return { invitation, sections };
  }
}
