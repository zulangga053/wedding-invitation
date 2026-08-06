import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { GalleryPhoto, GalleryPhotoInput } from '@momentia/shared';
import { PublicEventResolver } from '../../common/services/public-event-resolver';
import { AuditService } from '../audit/audit.service';
import {
  GALLERY_REPOSITORY,
  type GalleryRepository,
} from './gallery.repository';
import type { AuthenticatedUser } from '../../common/decorators';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(GALLERY_REPOSITORY) private readonly repository: GalleryRepository,
    private readonly resolver: PublicEventResolver,
    private readonly audit: AuditService,
  ) {}

  list(tenantId: string, eventId: string): Promise<GalleryPhoto[]> {
    return this.repository.list(tenantId, eventId);
  }

  async listPublic(slug: string): Promise<GalleryPhoto[]> {
    const { tenantId, eventId } = await this.resolver.resolve(slug);
    return this.repository.list(tenantId, eventId);
  }

  async getById(
    tenantId: string,
    eventId: string,
    photoId: string,
  ): Promise<GalleryPhoto> {
    const photo = await this.repository.findById(tenantId, eventId, photoId);
    if (!photo)
      throw new NotFoundException(`Gallery photo ${photoId} not found`);
    return photo;
  }

  async create(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    input: GalleryPhotoInput,
  ): Promise<GalleryPhoto> {
    const existing = await this.repository.list(tenantId, eventId);
    const photo: GalleryPhoto = {
      id: randomUUID(),
      tenantId,
      eventId,
      imageUrl: input.imageUrl,
      caption: input.caption,
      order: input.order ?? existing.length,
      createdAt: new Date().toISOString(),
    };
    await this.repository.create(tenantId, eventId, photo);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gallery.create',
      targetId: photo.id,
    });
    return photo;
  }

  async update(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    photoId: string,
    input: GalleryPhotoInput,
  ): Promise<GalleryPhoto> {
    const updated = await this.repository.update(
      tenantId,
      eventId,
      photoId,
      input,
    );
    if (!updated)
      throw new NotFoundException(`Gallery photo ${photoId} not found`);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gallery.update',
      targetId: photoId,
    });
    return updated;
  }

  async remove(
    user: AuthenticatedUser,
    tenantId: string,
    eventId: string,
    photoId: string,
  ): Promise<void> {
    await this.repository.remove(tenantId, eventId, photoId);
    await this.audit.log({
      tenantId,
      actorUid: user.uid,
      action: 'gallery.delete',
      targetId: photoId,
    });
  }
}
