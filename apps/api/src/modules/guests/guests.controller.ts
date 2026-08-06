import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { GuestInput } from '@momentia/shared';
import { GuestImportRowSchema, GuestInputSchema } from '@momentia/shared';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { GuestsService } from './guests.service';

const GuestListQuerySchema = z.object({
  attendance: z.string().optional(),
  search: z.string().max(80).optional(),
  group: z.string().max(60).optional(),
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
type GuestListQuery = z.infer<typeof GuestListQuerySchema>;

const GuestPatchSchema = GuestInputSchema.partial();
type GuestPatchInput = z.infer<typeof GuestPatchSchema>;

const ImportSchema = z.array(GuestImportRowSchema).min(1).max(500);
type ImportPayload = z.infer<typeof ImportSchema>;

@UseGuards(TenantGuard)
@Controller('tenants/:tenantId/events/:eventId/guests')
export class GuestsController {
  constructor(private readonly guests: GuestsService) {}

  @Get()
  list(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Query(new ZodPipe(GuestListQuerySchema)) query: GuestListQuery,
  ) {
    return this.guests.list(tenantId, eventId, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(GuestInputSchema)) input: GuestInput,
  ) {
    return this.guests.create(user, tenantId, eventId, input);
  }

  @Post('import')
  importRows(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(ImportSchema)) rows: ImportPayload,
  ) {
    return this.guests.importRows(user, tenantId, eventId, rows);
  }

  @Get('export')
  exportList(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.guests.exportList(tenantId, eventId);
  }

  @Get(':guestId')
  get(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ) {
    return this.guests.getById(tenantId, eventId, guestId);
  }

  @Patch(':guestId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body(new ZodPipe(GuestPatchSchema)) input: GuestPatchInput,
  ) {
    return this.guests.update(user, tenantId, eventId, guestId, input);
  }

  @Delete(':guestId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ) {
    return this.guests.remove(user, tenantId, eventId, guestId);
  }

  @Post(':guestId/checkin')
  checkIn(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ) {
    return this.guests.checkIn(user, tenantId, eventId, guestId);
  }
}
