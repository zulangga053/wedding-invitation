import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { AuditModule } from '../audit/audit.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TenantsModule, AuditModule],
  controllers: [AdminController],
})
export class AdminModule {}
