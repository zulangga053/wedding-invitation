import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AUDIT_REPOSITORY,
  type AuditRepository,
  type AuditLog,
} from './audit.repository';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export interface AuditEvent {
  tenantId?: string;
  actorUid: string;
  action: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}

/**
 * Phased audit trail. MVP writes a structured log locally and (best effort) to
 * Firestore `auditLogs`. A dedicated Audit module/pipeline replaces the console
 * sink in a later phase.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly repository: AuditRepository,
    private readonly firebase: FirebaseAdminService,
  ) {}

  log(event: AuditEvent): Promise<void> {
    const entry = {
      tenantId: event.tenantId,
      actorUid: event.actorUid,
      action: event.action,
      targetId: event.targetId ?? null,
      meta: event.meta ?? {},
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `${entry.actorUid} ${entry.action} ${entry.targetId ?? ''}${
        entry.tenantId ? ` @${entry.tenantId}` : ''
      }`,
    );

    if (!this.firebase.isConfigured) return Promise.resolve();
    try {
      return this.firebase.firestore
        .collection('auditLogs')
        .add(entry)
        .then(() => undefined);
    } catch (err) {
      this.logger.warn(
        `Audit write failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
      return Promise.resolve();
    }
  }

  listAll(limit = 100): Promise<AuditLog[]> {
    return this.repository.listAll(limit);
  }
}
