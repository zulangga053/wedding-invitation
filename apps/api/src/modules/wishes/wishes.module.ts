import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { FirestoreWishRepository, WISH_REPOSITORY } from './wish.repository';
import { WishesController } from './wishes.controller';
import { WishesService } from './wishes.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [WishesController],
  providers: [
    WishesService,
    { provide: WISH_REPOSITORY, useClass: FirestoreWishRepository },
  ],
  exports: [WishesService],
})
export class WishesModule {}
