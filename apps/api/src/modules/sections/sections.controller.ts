import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { SectionInputSchema } from '@momentia/shared';
import { CurrentUser, type AuthenticatedUser } from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { SectionsService } from './sections.service';

const SectionPatchSchema = z.object({
  enabled: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

const ReorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

@UseGuards(TenantGuard)
@Controller('tenants/:tenantId/events/:eventId/sections')
export class SectionsController {
  constructor(private readonly sections: SectionsService) {}

  @Get()
  list(@Param('tenantId') tenantId: string, @Param('eventId') eventId: string) {
    return this.sections.list(tenantId, eventId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(SectionInputSchema))
    input: z.infer<typeof SectionInputSchema>,
  ) {
    return this.sections.create(user, tenantId, eventId, input);
  }

  @Put(':sectionId')
  updateData(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('sectionId') sectionId: string,
    @Body(new ZodPipe(SectionInputSchema))
    input: z.infer<typeof SectionInputSchema>,
  ) {
    return this.sections.updateData(tenantId, eventId, sectionId, input);
  }

  @Patch(':sectionId')
  patch(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('sectionId') sectionId: string,
    @Body(new ZodPipe(SectionPatchSchema))
    input: { enabled?: boolean; order?: number },
  ) {
    return this.sections.patch(tenantId, eventId, sectionId, input);
  }

  @Post('reorder')
  reorder(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(ReorderSchema)) input: { orderedIds: string[] },
  ) {
    return this.sections.reorder(tenantId, eventId, input.orderedIds);
  }

  @Delete(':sectionId')
  remove(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.sections.remove(tenantId, eventId, sectionId);
  }
}
