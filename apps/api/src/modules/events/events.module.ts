import { Module } from '@nestjs/common';
import { EVENT_REPOSITORY, FirestoreEventRepository } from './event.repository';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { READ_MODEL_SERVICE, ReadModelService } from './read-model.service';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    { provide: EVENT_REPOSITORY, useClass: FirestoreEventRepository },
    { provide: READ_MODEL_SERVICE, useClass: ReadModelService },
  ],
  exports: [EventsService],
})
export class EventsModule {}
