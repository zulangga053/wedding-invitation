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
import type { GalleryPhotoInput } from '@momentia/shared';
import { GalleryPhotoInputSchema } from '@momentia/shared';
import {
  CurrentUser,
  Public,
  type AuthenticatedUser,
} from '../../common/decorators';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ZodPipe } from '../../common/pipes/zod-validation.pipe';
import { GalleryService } from './gallery.service';

@Controller()
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  @Public()
  @Get('public/events/:slug/gallery')
  listPublic(@Param('slug') slug: string) {
    return this.gallery.listPublic(slug);
  }

  @UseGuards(TenantGuard)
  @Get('tenants/:tenantId/events/:eventId/gallery')
  list(@Param('tenantId') tenantId: string, @Param('eventId') eventId: string) {
    return this.gallery.list(tenantId, eventId);
  }

  @UseGuards(TenantGuard)
  @Post('tenants/:tenantId/events/:eventId/gallery')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Body(new ZodPipe(GalleryPhotoInputSchema)) input: GalleryPhotoInput,
  ) {
    return this.gallery.create(user, tenantId, eventId, input);
  }

  @UseGuards(TenantGuard)
  @Patch('tenants/:tenantId/events/:eventId/gallery/:photoId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('photoId') photoId: string,
    @Body(new ZodPipe(GalleryPhotoInputSchema)) input: GalleryPhotoInput,
  ) {
    return this.gallery.update(user, tenantId, eventId, photoId, input);
  }

  @UseGuards(TenantGuard)
  @Delete('tenants/:tenantId/events/:eventId/gallery/:photoId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
    @Param('photoId') photoId: string,
  ) {
    return this.gallery.remove(user, tenantId, eventId, photoId);
  }
}
