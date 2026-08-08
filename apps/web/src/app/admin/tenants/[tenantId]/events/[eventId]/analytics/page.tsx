'use client';

import { use } from 'react';
import type { AnalyticsSummary, DailyStat } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';

const METRIC_LABELS: Record<string, string> = {
  views: 'Kunjungan',
  rsvp: 'RSVP',
  wishes: 'Ucapan',
  giftConfirmations: 'Konfirmasi Hadiah',
  shares: 'Bagikan',
};

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-foreground/10 bg-background rounded-2xl border p-5">
      <p className="text-foreground/50 text-xs uppercase tracking-wider">{label}</p>
      <p className="font-display text-foreground mt-2 text-3xl font-semibold">
        {value.toLocaleString('id-ID')}
      </p>
    </div>
  );
}

export default function EventAnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
}) {
  const { tenantId, eventId } = use(params);
  const base = `/tenants/${tenantId}/events/${eventId}/analytics`;
  const summary = useApiQuery<AnalyticsSummary>(`${base}/summary?days=30`);

  const days = lastNDays(14);
  const from = days[0];
  const to = days[days.length - 1];
  const daily = useApiQuery<DailyStat[]>(`${base}/daily?from=${from}&to=${to}`);

  const stats = daily.data ?? [];
  const byDate = new Map(stats.map((s) => [s.date, s]));
  const chart = days.map((date) => byDate.get(date)?.views ?? 0);
  const max = Math.max(1, ...chart);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-foreground text-3xl font-semibold">Analitik</h1>
        <p className="text-foreground/60 mt-1 text-sm">
          Ringkasan performa undangan 30 hari terakhir.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {(Object.keys(METRIC_LABELS) as (keyof AnalyticsSummary)[]).map((key) => (
          <MetricCard key={key} label={METRIC_LABELS[key]} value={summary.data?.[key] ?? 0} />
        ))}
      </div>

      <div className="border-foreground/10 bg-background rounded-2xl border p-6">
        <h2 className="text-foreground mb-6 text-lg font-medium">Kunjungan 14 Hari Terakhir</h2>
        <div className="flex h-48 items-end gap-1">
          {chart.map((value, i) => (
            <div key={days[i]} className="group flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="bg-brand-primary/70 group-hover:bg-brand-primary w-full rounded-t-md transition-colors"
                  style={{ height: `${(value / max) * 100}%` }}
                  title={`${days[i]}: ${value} kunjungan`}
                />
              </div>
              <span className="text-foreground/40 text-[10px]">
                {new Date(`${days[i]}T00:00:00Z`).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
        {daily.isLoading ? <p className="text-foreground/50 mt-4 text-sm">Memuat data…</p> : null}
      </div>
    </div>
  );
}
