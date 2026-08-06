import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FirestoreRsvpRepository, RSVP_REPOSITORY } from './rsvp.repository';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [RsvpController],
  providers: [
    RsvpService,
    { provide: RSVP_REPOSITORY, useClass: FirestoreRsvpRepository },
  ],
  exports: [RsvpService],
})
export class RsvpModule {}
