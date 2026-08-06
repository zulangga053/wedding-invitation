import { Injectable } from '@nestjs/common';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  AnalyticsEventType,
  AnalyticsMetric,
  DailyStat,
} from '@momentia/shared';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

export const ANALYTICS_REPOSITORY = Symbol('ANALYTICS_REPOSITORY');

export interface AnalyticsEventEntry {
  type: AnalyticsEventType;
  eventId: string;
  tenantId: string;
  referrer?: string;
  device?: string;
  browser?: string;
  sessionId?: string;
  ts: string;
}

export interface AnalyticsRepository {
  increment(
    tenantId: string,
    eventId: string,
    metric: AnalyticsMetric,
  ): Promise<void>;
  recordEvent(entry: AnalyticsEventEntry): Promise<void>;
  daily(
    tenantId: string,
    eventId: string,
    from: string,
    to: string,
  ): Promise<DailyStat[]>;
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class FirestoreAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly firebase: FirebaseAdminService) {}

  private get db() {
    return this.firebase.firestore;
  }

  private dailyRef(tenantId: string, eventId: string, date: string) {
    return this.db.doc(
      `tenants/${tenantId}/events/${eventId}/analytics/daily/${date}`,
    );
  }

  async increment(
    tenantId: string,
    eventId: string,
    metric: AnalyticsMetric,
  ): Promise<void> {
    const date = todayKey();
    await this.dailyRef(tenantId, eventId, date).set(
      { date, [metric]: FieldValue.increment(1) },
      { merge: true },
    );
  }

  async recordEvent(entry: AnalyticsEventEntry): Promise<void> {
    await this.db
      .collection(
        `tenants/${entry.tenantId}/events/${entry.eventId}/analytics/events`,
      )
      .add(entry);
  }

  async daily(
    tenantId: string,
    eventId: string,
    from: string,
    to: string,
  ): Promise<DailyStat[]> {
    const snap = await this.db
      .collection(`tenants/${tenantId}/events/${eventId}/analytics/daily`)
      .where('date', '>=', from)
      .where('date', '<=', to)
      .orderBy('date', 'asc')
      .get();
    return snap.docs.map((doc) => doc.data() as DailyStat);
  }
}
