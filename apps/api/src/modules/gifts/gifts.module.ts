import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FirestoreGiftRepository, GIFT_REPOSITORY } from './gift.repository';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [GiftsController],
  providers: [
    GiftsService,
    { provide: GIFT_REPOSITORY, useClass: FirestoreGiftRepository },
  ],
  exports: [GiftsService],
})
export class GiftsModule {}
