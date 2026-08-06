import {
  Body,
  Controller,
  Delete,
  Get,
  ForbiddenException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  MemberCreateInput,
  TenantCreateInput,
  TenantUpdateInput,
} from '@momentia/shared';
import {
  CurrentMember,
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { TenantsService } from './tenants.service';
import {
  MemberCreateSchema,
  TenantCreateSchema,
  TenantUpdateSchema,
} from '@momentia/shared';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.tenants.listForUser(user);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodPipe(TenantCreateSchema)) input: TenantCreateInput,
  ) {
    return this.tenants.create(user, input);
  }

  @UseGuards(TenantGuard, RolesGuard)
  @Get(':tenantId')
  get(@Param('tenantId') tenantId: string) {
    return this.tenants.getById(tenantId);
  }

  @UseGuards(TenantGuard)
  @Patch(':tenantId')
  update(
    @Param('tenantId') tenantId: string,
    @Body(new ZodPipe(TenantUpdateSchema)) input: TenantUpdateInput,
  ) {
    return this.tenants.update(tenantId, input);
  }

  @UseGuards(TenantGuard)
  @Post(':tenantId/members')
  addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @CurrentMember() member: { role?: string },
    @Body(new ZodPipe(MemberCreateSchema)) input: MemberCreateInput,
  ) {
    return this.tenants.addMember(user, tenantId, input, member);
  }

  @UseGuards(TenantGuard)
  @Delete(':tenantId')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @CurrentMember() member: { role?: string },
  ) {
    if (member.role !== 'owner' && !user.superAdmin) {
      throw new ForbiddenException(
        'Only the tenant owner can delete the tenant',
      );
    }
    return this.tenants.deactivate(tenantId, user);
  }
}
