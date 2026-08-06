import { Injectable } from '@nestjs/common';
import type { GalleryPhoto, GalleryPhotoInput } from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const GALLERY_REPOSITORY = Symbol('GALLERY_REPOSITORY');

export interface GalleryRepository {
  list(tenantId: string, eventId: string): Promise<GalleryPhoto[]>;
  findById(
    tenantId: string,
    eventId: string,
    photoId: string,
  ): Promise<GalleryPhoto | null>;
  create(
    tenantId: string,
    eventId: string,
    photo: GalleryPhoto,
  ): Promise<GalleryPhoto>;
  update(
    tenantId: string,
    eventId: string,
    photoId: string,
    input: GalleryPhotoInput,
  ): Promise<GalleryPhoto | null>;
  remove(tenantId: string, eventId: string, photoId: string): Promise<void>;
}

@Injectable()
export class FirestoreGalleryRepository implements GalleryRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private col(tenantId: string, eventId: string) {
    return this.db.collection(`tenants/${tenantId}/events/${eventId}/gallery`);
  }

  private ref(tenantId: string, eventId: string, photoId: string) {
    return this.col(tenantId, eventId).doc(photoId);
  }

  async list(tenantId: string, eventId: string): Promise<GalleryPhoto[]> {
    const snap = await this.col(tenantId, eventId)
      .orderBy('order', 'asc')
      .get();
    return snap.docs.map((doc) => doc.data() as GalleryPhoto);
  }

  async findById(
    tenantId: string,
    eventId: string,
    photoId: string,
  ): Promise<GalleryPhoto | null> {
    const snap = await this.ref(tenantId, eventId, photoId).get();
    return snap.exists ? (snap.data() as GalleryPhoto) : null;
  }

  async create(
    tenantId: string,
    eventId: string,
    photo: GalleryPhoto,
  ): Promise<GalleryPhoto> {
    await this.ref(tenantId, eventId, photo.id).set(photo);
    return photo;
  }

  async update(
    tenantId: string,
    eventId: string,
    photoId: string,
    input: GalleryPhotoInput,
  ): Promise<GalleryPhoto | null> {
    const current = await this.findById(tenantId, eventId, photoId);
    if (!current) return null;
    await this.ref(tenantId, eventId, photoId).update(input);
    return this.findById(tenantId, eventId, photoId);
  }

  async remove(
    tenantId: string,
    eventId: string,
    photoId: string,
  ): Promise<void> {
    await this.ref(tenantId, eventId, photoId).delete();
  }
}
