import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { RsvpCreateInput } from '@momentia/shared';
import { RsvpCreateSchema } from '@momentia/shared';
import { Public } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { RsvpService } from './rsvp.service';

const RsvpListQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
type RsvpListQuery = z.infer<typeof RsvpListQuerySchema>;

@Controller()
export class RsvpController {
  constructor(private readonly rsvp: RsvpService) {}

  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 20, windowMs: 60_000 })
  @Post('public/events/:slug/rsvp')
  create(
    @Param('slug') slug: string,
    @Body(new ZodPipe(RsvpCreateSchema)) input: RsvpCreateInput,
  ) {
    return this.rsvp.createPublic(input);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/rsvp')
  list(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Query(new ZodPipe(RsvpListQuerySchema)) query: RsvpListQuery,
  ) {
    return this.rsvp.list(tenantId, eventId, query);
  }
}
