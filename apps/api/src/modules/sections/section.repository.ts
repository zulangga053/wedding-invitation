import { Injectable } from '@nestjs/common';
import type { Section } from '@momentia/shared';
import type { UpdateData } from 'firebase-admin/firestore';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const SECTION_REPOSITORY = Symbol('SECTION_REPOSITORY');

export interface SectionPatch {
  data?: unknown;
  enabled?: boolean;
  order?: number;
  schemaVersion?: number;
}

export interface SectionRepository {
  listForEvent(tenantId: string, eventId: string): Promise<Section[]>;
  create(tenantId: string, eventId: string, section: Section): Promise<Section>;
  findById(
    tenantId: string,
    eventId: string,
    sectionId: string,
  ): Promise<Section | null>;
  update(
    tenantId: string,
    eventId: string,
    sectionId: string,
    patch: SectionPatch,
  ): Promise<Section | null>;
  remove(tenantId: string, eventId: string, sectionId: string): Promise<void>;
  replaceOrder(
    tenantId: string,
    eventId: string,
    orderedIds: string[],
  ): Promise<void>;
}

@Injectable()
export class FirestoreSectionRepository implements SectionRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/sections`);
  }

  private ref(tenantId: string, eventId: string, sectionId: string) {
    return this.col(tenantId, eventId).doc(sectionId);
  }

  async listForEvent(tenantId: string, eventId: string): Promise<Section[]> {
    const snap = await this.col(tenantId, eventId)
      .orderBy('order', 'asc')
      .get();
    return snap.docs.map((doc) => doc.data() as Section);
  }

  async findById(
    tenantId: string,
    eventId: string,
    sectionId: string,
  ): Promise<Section | null> {
    const snap = await this.ref(tenantId, eventId, sectionId).get();
    return snap.exists ? (snap.data() as Section) : null;
  }

  async create(
    tenantId: string,
    eventId: string,
    section: Section,
  ): Promise<Section> {
    // Clean up undefined values before saving to Firestore
    const cleanSection = Object.fromEntries(
      Object.entries(section).filter(([_, value]) => value !== undefined),
    );
    await this.ref(tenantId, eventId, section.id).set(cleanSection);
    return section;
  }

  async update(
    tenantId: string,
    eventId: string,
    sectionId: string,
    patch: SectionPatch,
  ): Promise<Section | null> {
    const current = await this.findById(tenantId, eventId, sectionId);
    if (!current) return null;
    // Clean up undefined values from patch before updating
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([_, value]) => value !== undefined),
    );
    await this.ref(tenantId, eventId, sectionId).update(
      cleanPatch as UpdateData<Section>,
    );
    const updated = await this.findById(tenantId, eventId, sectionId);
    return updated;
  }

  async remove(
    tenantId: string,
    eventId: string,
    sectionId: string,
  ): Promise<void> {
    await this.ref(tenantId, eventId, sectionId).delete();
  }

  async replaceOrder(
    tenantId: string,
    eventId: string,
    orderedIds: string[],
  ): Promise<void> {
    const batch = this.db.batch();
    orderedIds.forEach((id, index) => {
      batch.update(this.ref(tenantId, eventId, id), { order: index });
    });
    await batch.commit();
  }
}
