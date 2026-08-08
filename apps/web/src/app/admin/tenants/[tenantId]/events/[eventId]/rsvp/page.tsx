'use client';

import { use, useState } from 'react';
import { useApiQuery } from '@/lib/api/use-api';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/components/providers/auth-provider';
import type { Rsvp } from '@momentia/shared';
import { Button } from '@/components/ui/button';

interface RsvpPage {
  items: Rsvp[];
  nextCursor?: string;
}

export default function EventRsvpPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
}) {
  const { tenantId, eventId } = use(params);
  const { getToken } = useAuth();
  const path = `/tenants/${tenantId}/events/${eventId}/rsvp`;
  const [cursors, setCursors] = useState<string[]>([]);

  const cursor = cursors[cursors.length - 1];
  const page = useApiQuery<RsvpPage>(
    `${path}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`
  );
  const list = page.data?.items ?? [];

  async function exportCsv() {
    const token = await getToken();
    const all: Rsvp[] = [];
    let next: string | undefined;
    do {
      const result = await apiFetch<RsvpPage>(
        `${path}${next ? `?cursor=${encodeURIComponent(next)}` : ''}`,
        {
          token,
        }
      );
      all.push(...result.items);
      next = result.nextCursor;
    } while (next);
    const header = 'guestName,attendance,guestCount,contact,message,inviteCode,createdAt';
    const lines = all.map((r) =>
      [
        r.guestName,
        r.attendance,
        r.guestCount,
        r.contact ?? '',
        r.message ?? '',
        r.inviteCode ?? '',
        r.createdAt,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-foreground text-3xl font-semibold">RSVP</h1>
          <p className="text-foreground/60 mt-1 text-sm">
            Lihat konfirmasi kehadiran dari tamu undangan.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
          Export CSV
        </Button>
      </div>

      {page.isLoading ? (
        <p className="text-foreground/50 text-sm">Memuat RSVP…</p>
      ) : (
        <div className="border-foreground/5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-foreground/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tamu</th>
                <th className="px-4 py-3">Kehadiran</th>
                <th className="px-4 py-3">Jumlah</th>
                <th className="px-4 py-3">Pesan</th>
                <th className="px-4 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-foreground/5 divide-y">
              {list.map((r) => (
                <tr key={r.id} className="bg-background">
                  <td className="px-4 py-3">
                    <p className="text-foreground font-medium">{r.guestName}</p>
                    {r.contact ? <p className="text-foreground/50 text-xs">{r.contact}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${attendanceBadge(r.attendance)}`}
                    >
                      {attendanceLabel(r.attendance)}
                    </span>
                  </td>
                  <td className="text-foreground/70 px-4 py-3">{r.guestCount} org</td>
                  <td className="max-w-xs px-4 py-3">
                    {r.message ? (
                      <p className="text-foreground/70 truncate">{r.message}</p>
                    ) : (
                      <span className="text-foreground/40">—</span>
                    )}
                  </td>
                  <td className="text-foreground/50 px-4 py-3 text-xs">
                    {new Date(r.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? (
            <p className="text-foreground/50 px-4 py-8 text-center text-sm">
              Belum ada konfirmasi RSVP.
            </p>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={cursors.length === 0}
          onClick={() => {
            const next = cursors.slice(0, -1);
            setCursors(next);
          }}
          className="disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <span className="text-foreground/50">{list.length} konfirmasi</span>
        <button
          type="button"
          disabled={!page.data?.nextCursor}
          onClick={() => page.data?.nextCursor && setCursors([...cursors, page.data.nextCursor])}
          className="disabled:opacity-40"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}

function attendanceLabel(status: string): string {
  return { yes: 'Hadir', no: 'Berhalangan', maybe: 'Ragu' }[status] ?? status;
}

function attendanceBadge(status: string): string {
  return (
    {
      yes: 'bg-emerald-50 text-emerald-700',
      no: 'bg-red-50 text-red-600',
      maybe: 'bg-foreground/5 text-foreground/50',
    }[status] ?? ''
  );
}
