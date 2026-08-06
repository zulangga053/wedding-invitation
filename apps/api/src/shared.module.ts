import { Global, Module } from '@nestjs/common';
import { RateLimitGuard } from './common/rate-limit/rate-limit.guard';
import { RedisService } from './common/rate-limit/redis.service';
import { PublicEventResolver } from './common/services/public-event-resolver';

@Global()
@Module({
  providers: [RedisService, RateLimitGuard, PublicEventResolver],
  exports: [RedisService, RateLimitGuard, PublicEventResolver],
})
export class SharedModule {}
