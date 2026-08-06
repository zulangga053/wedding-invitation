import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { zTenantStatus } from '@momentia/shared';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { TenantsService } from '../tenants/tenants.service';
import { AuditService } from '../audit/audit.service';

const ListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional(),
});
const SetStatusBody = z.object({ status: zTenantStatus });

@UseGuards(RolesGuard)
@Roles('superAdmin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly tenants: TenantsService,
    private readonly audit: AuditService,
  ) {}

  @Get('tenants')
  listTenants(@Query(new ZodPipe(ListQuery)) query: z.infer<typeof ListQuery>) {
    return this.tenants.listAll(query.limit);
  }

  @Patch('tenants/:tenantId/status')
  setTenantStatus(
    @Param('tenantId') tenantId: string,
    @Body(new ZodPipe(SetStatusBody))
    body: { status: z.infer<typeof zTenantStatus> },
  ) {
    return this.tenants.setStatus(tenantId, body.status);
  }

  @Get('audit-logs')
  auditLogs(@Query(new ZodPipe(ListQuery)) query: z.infer<typeof ListQuery>) {
    return this.audit.listAll(query.limit);
  }
}
