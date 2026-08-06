import { Module } from '@nestjs/common';
import {
  FirestoreTenantRepository,
  TENANT_REPOSITORY,
} from './tenant.repository';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [
    TenantsService,
    { provide: TENANT_REPOSITORY, useClass: FirestoreTenantRepository },
  ],
  exports: [TenantsService],
})
export class TenantsModule {}
