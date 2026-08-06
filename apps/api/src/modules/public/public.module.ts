import { Module } from '@nestjs/common';
import { GiftsModule } from '../gifts/gifts.module';
import { EventsModule } from '../events/events.module';
import { PublicController } from './public.controller';
import { PublicInvitationsService } from './public-invitations.service';

@Module({
  imports: [GiftsModule, EventsModule],
  controllers: [PublicController],
  providers: [PublicInvitationsService],
})
export class PublicModule {}
