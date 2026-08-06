import { Module } from '@nestjs/common';
import {
  SECTION_REPOSITORY,
  FirestoreSectionRepository,
} from './section.repository';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  controllers: [SectionsController],
  providers: [
    SectionsService,
    { provide: SECTION_REPOSITORY, useClass: FirestoreSectionRepository },
  ],
  exports: [SectionsService],
})
export class SectionsModule {}
