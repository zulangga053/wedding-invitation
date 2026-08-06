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
import type { EventCreateInput, EventUpdateInput } from '@momentia/shared';
import { EventCreateSchema, EventUpdateSchema } from '@momentia/shared';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { EventsService } from './events.service';

@UseGuards(TenantGuard)
@Controller('tenants/:tenantId/events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Param('tenantId') tenantId: string) {
    return this.events.list(tenantId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Body(new ZodPipe(EventCreateSchema)) input: EventCreateInput,
  ) {
    return this.events.create(user, tenantId, input);
  }

  @Get(':eventId')
  get(@Param('tenantId') tenantId: string, @Param('eventId') eventId: string) {
    return this.events.getById(tenantId, eventId);
  }

  @Patch(':eventId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(EventUpdateSchema)) input: EventUpdateInput,
  ) {
    return this.events.update(user, tenantId, eventId, input);
  }

  @Post(':eventId/publish')
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.events.publish(user, tenantId, eventId);
  }

  @Post(':eventId/unpublish')
  unpublish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.events.unpublish(user, tenantId, eventId);
  }

  @Delete(':eventId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.events.remove(user, tenantId, eventId);
  }
}
