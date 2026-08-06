import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditLog {
  id: string;
  tenantId?: string;
  actorUid: string;
  action: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditRepository {
  listAll(limit: number): Promise<AuditLog[]>;
}

@Injectable()
export class FirestoreAuditRepository implements AuditRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  async listAll(limit: number): Promise<AuditLog[]> {
    const snap = await this.db
      .collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(Math.min(limit, 1000))
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as AuditLog);
  }
}
