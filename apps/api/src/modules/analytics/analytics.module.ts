import { Module } from '@nestjs/common';
import {
  ANALYTICS_REPOSITORY,
  FirestoreAnalyticsRepository,
} from './analytics.repository';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    { provide: ANALYTICS_REPOSITORY, useClass: FirestoreAnalyticsRepository },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
