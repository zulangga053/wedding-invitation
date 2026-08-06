'use client';

import { use, useState } from 'react';
import QRCode from 'qrcode';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Guest } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GuestPage {
  items: Guest[];
  nextCursor?: string;
}

function QrModal({ guest }: { guest: Guest }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function openQr() {
    const payload = `MOMENTIA-CHECKIN:${guest.eventId}:${guest.id}`;
    const data = await QRCode.toDataURL(payload, { width: 240, margin: 1 });
    setDataUrl(data);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void openQr()}
        className="rounded-md border border-foreground/15 px-2.5 py-1 text-xs text-foreground/70 hover:border-brand-primary/50"
      >
        QR
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="rounded-2xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt={`QR ${guest.name}`} width={240} height={240} />
            ) : null}
            <p className="mt-3 text-sm font-medium text-foreground">{guest.name}</p>
            <p className="text-xs text-foreground/50">Scan untuk check-in tamu</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function EventGuestsPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
}) {
  const { tenantId, eventId } = use(params);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const path = `/tenants/${tenantId}/events/${eventId}/guests`;

  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState('');
  const [newName, setNewName] = useState('');
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];

  const paramsQuery = [
    attendance ? `attendance=${encodeURIComponent(attendance)}` : '',
    search ? `search=${encodeURIComponent(search)}` : '',
    cursor ? `cursor=${encodeURIComponent(cursor)}` : '',
  ]
    .filter(Boolean)
    .join('&');

  const page = useApiQuery<GuestPage>(`${path}?${paramsQuery}`);
  const list = page.data?.items ?? [];

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: [path] });

  const addGuest = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch(`${path}`, {
        method: 'POST',
        token,
        body: { name: newName, tags: [] },
      });
    },
    onSuccess: () => {
      setNewName('');
      invalidate();
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiFetch(`${path}/${id}`, { method: 'DELETE', token });
    },
    onSuccess: invalidate,
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiFetch(`${path}/${id}/checkin`, { method: 'POST', token, body: {} });
    },
    onSuccess: invalidate,
  });


  async function exportCsv() {
    const token = await getToken();
    const rows = await apiFetch<Guest[]>(`${path}/export`, { token });
    const header = 'name,category,phone,attendance,checkedIn';
    const lines = rows.map((g) =>
      [g.name, g.category ?? '', g.phone ?? '', g.attendance, g.checkIn?.status ? 'yes' : 'no']
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tamu-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const rows = text
      .split('\n')
      .filter((line) => line.trim())
      .slice(1)
      .map((line) => {
        const [name = '', category = '', phone = ''] = line.split(',').map((v) => v.trim().replaceAll('"', ''));
        return { name, category: category || undefined, phone: phone || undefined, tags: [] };
      })
      .filter((row) => row.name);
    const token = await getToken();
    await apiFetch(`${path}/import`, { method: 'POST', token, body: rows });
    invalidate();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Tamu</h1>
          <p className="mt-1 text-sm text-foreground/60">Kelola daftar tamu, QR, dan check-in.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-full border border-foreground/15 px-4 py-2 text-xs font-medium text-foreground/80">
            Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importCsv(file);
              }}
            />
          </label>
          <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label>Nama Tamu</Label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama tamu baru" />
        </div>
        <Button onClick={() => void addGuest.mutate()} disabled={newName.trim().length < 2}>
          Tambah Tamu
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCursors([]);
          }}
          placeholder="Cari nama…"
          className="max-w-xs"
        />
        <select
          value={attendance}
          onChange={(e) => {
            setAttendance(e.target.value);
            setCursors([]);
          }}
          className="h-11 rounded-xl border border-foreground/15 bg-background px-3 text-sm"
        >
          <option value="">Semua kehadiran</option>
          <option value="pending">Belum konfirmasi</option>
          <option value="yes">Hadir</option>
          <option value="no">Berhalangan</option>
          <option value="maybe">Ragu</option>
        </select>
      </div>

      {page.isLoading ? (
        <p className="text-sm text-foreground/50">Memuat tamu…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-foreground/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-xs uppercase tracking-wider text-foreground/60">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kehadiran</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {list.map((guest) => (
                <tr key={guest.id} className="bg-background">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{guest.name}</p>
                    {guest.phone ? <p className="text-xs text-foreground/50">{guest.phone}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${attendanceBadge(guest.attendance)}`}>
                      {attendanceLabel(guest.attendance)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {guest.checkIn?.status ? (
                      <span className="text-xs font-medium text-emerald-600">✓ {guest.checkIn.at?.slice(0, 10)}</span>
                    ) : (
                      <span className="text-xs text-foreground/40">Belum</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <QrModal guest={guest} />
                      {!guest.checkIn?.status ? (
                        <button
                          type="button"
                          onClick={() => void checkIn.mutate(guest.id)}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Check-in
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void deleteGuest.mutate(guest.id)}
                        className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-foreground/50">Belum ada tamu.</p>
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
        <span className="text-foreground/50">{list.length} tamu</span>
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
  return { pending: 'Pending', yes: 'Hadir', no: 'Berhalangan', maybe: 'Ragu' }[status] ?? status;
}
function attendanceBadge(status: string): string {
  return {
    pending: 'bg-amber-50 text-amber-700',
    yes: 'bg-emerald-50 text-emerald-700',
    no: 'bg-red-50 text-red-600',
    maybe: 'bg-foreground/5 text-foreground/50',
  }[status] ?? '';
}