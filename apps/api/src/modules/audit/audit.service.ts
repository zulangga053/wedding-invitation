import { Injectable, Logger } from '@nestjs/common';
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

  constructor(private readonly firebase: FirebaseAdminService) {}

  async log(event: AuditEvent): Promise<void> {
    const entry = {
      tenantId: event.tenantId,
      actorUid: event.actorUid,
      action: event.action,
      targetId: event.targetId ?? null,
      meta: event.meta ?? {},
      timestamp: new Date().toISOString(),
    };

    this.logger.log(
      `${entry.actorUid} ${entry.action} ${entry.targetId ?? ''}${entry.tenantId ? ` @${entry.tenantId}` : ''}`,
    );

    if (!this.firebase.isConfigured) return;
    try {
      await this.firebase.firestore.collection('auditLogs').add(entry);
    } catch (err) {
      this.logger.warn(
        `Audit write failed: ${err instanceof Error ? err.message : 'unknown'}`,
      );
    }
  }
}
