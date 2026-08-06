import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { WishCreateInput } from '@momentia/shared';
import { WishCreateSchema } from '@momentia/shared';
import { Public } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { WishesService } from './wishes.service';

const WishListQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
type WishListQuery = z.infer<typeof WishListQuerySchema>;

const ModerateSchema = z.object({ isApproved: z.boolean() });

@Controller()
export class WishesController {
  constructor(private readonly wishes: WishesService) {}

  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 15, windowMs: 60_000 })
  @Post('public/events/:slug/wishes')
  create(
    @Param('slug') slug: string,
    @Body(new ZodPipe(WishCreateSchema)) input: WishCreateInput,
  ) {
    return this.wishes.createPublic(input);
  }

  @Public()
  @Get('public/events/:slug/wishes')
  listPublic(
    @Param('slug') slug: string,
    @Query(new ZodPipe(WishListQuerySchema)) query: WishListQuery,
  ) {
    return this.wishes.listPublic(slug, query);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/wishes')
  listAdmin(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Query(new ZodPipe(WishListQuerySchema)) query: WishListQuery,
  ) {
    return this.wishes.listAdmin(tenantId, eventId, query);
  }

  @UseGuards(TenantGuard)
  @Patch('tenants/:tenantId/events/:eventId/wishes/:wishId')
  moderate(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('wishId') wishId: string,
    @Body(new ZodPipe(ModerateSchema)) input: { isApproved: boolean },
  ) {
    return this.wishes.moderate(tenantId, eventId, wishId, input.isApproved);
  }

  @UseGuards(TenantGuard)
  @Delete('tenants/:tenantId/events/:eventId/wishes/:wishId')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('wishId') wishId: string,
  ) {
    return this.wishes.remove(tenantId, eventId, wishId);
  }
}
