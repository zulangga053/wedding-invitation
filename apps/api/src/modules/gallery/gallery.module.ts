import { Module } from '@nestjs/common';
import {
  FirestoreGalleryRepository,
  GALLERY_REPOSITORY,
} from './gallery.repository';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  controllers: [GalleryController],
  providers: [
    GalleryService,
    { provide: GALLERY_REPOSITORY, useClass: FirestoreGalleryRepository },
  ],
  exports: [GalleryService],
})
export class GalleryModule {}
