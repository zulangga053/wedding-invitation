import { Module } from '@nestjs/common';
import { FirestoreGuestRepository, GUEST_REPOSITORY } from './guest.repository';
import { GuestsController } from './guests.controller';
import { GuestsService } from './guests.service';

@Module({
  controllers: [GuestsController],
  providers: [
    GuestsService,
    { provide: GUEST_REPOSITORY, useClass: FirestoreGuestRepository },
  ],
  exports: [GuestsService],
})
export class GuestsModule {}
