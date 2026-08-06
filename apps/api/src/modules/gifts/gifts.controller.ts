import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { GiftConfirmInput, GiftInput } from '@momentia/shared';
import { GiftConfirmSchema, GiftInputSchema } from '@momentia/shared';
import {
  CurrentUser,
  Public,
  type AuthenticatedUser,
} from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { GiftsService } from './gifts.service';

@Controller()
export class GiftsController {
  constructor(private readonly gifts: GiftsService) {}

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/gifts')
  list(@Param('tenantId') tenantId: string, @Param('eventId') eventId: string) {
    return this.gifts.list(tenantId, eventId);
  }

  @UseGuards(TenantGuard)
  @Post('tenants/:tenantId/events/:eventId/gifts')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(GiftInputSchema)) input: GiftInput,
  ) {
    return this.gifts.create(user, tenantId, eventId, input);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/gifts/:giftId')
  get(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('giftId') giftId: string,
  ) {
    return this.gifts.getById(tenantId, eventId, giftId);
  }

  @UseGuards(TenantGuard)
  @Patch('tenants/:tenantId/events/:eventId/gifts/:giftId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('giftId') giftId: string,
    @Body(new ZodPipe(GiftInputSchema)) input: GiftInput,
  ) {
    return this.gifts.update(user, tenantId, eventId, giftId, input);
  }

  @UseGuards(TenantGuard)
  @Delete('tenants/:tenantId/events/:eventId/gifts/:giftId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('giftId') giftId: string,
  ) {
    return this.gifts.remove(user, tenantId, eventId, giftId);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/gifts/:giftId/confirmations')
  confirmations(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('giftId') giftId: string,
  ) {
    return this.gifts.confirmations(tenantId, eventId, giftId);
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 20, windowMs: 60_000 })
  @Post('public/events/:slug/gifts/:giftId/confirm')
  confirm(@Body(new ZodPipe(GiftConfirmSchema)) input: GiftConfirmInput) {
    return this.gifts.confirmPublic(input);
  }
}
