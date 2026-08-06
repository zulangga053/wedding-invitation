import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FirestoreAuditRepository, AUDIT_REPOSITORY } from './audit.repository';

@Global()
@Module({
  providers: [
    AuditService,
    { provide: AUDIT_REPOSITORY, useClass: FirestoreAuditRepository },
  ],
  exports: [AuditService],
})
export class AuditModule {}
