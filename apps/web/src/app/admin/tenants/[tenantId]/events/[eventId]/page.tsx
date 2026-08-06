'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event, Section } from '@momentia/shared';
import { BLOCK_TYPES } from '@momentia/shared';
import { useApiQuery } from '@/lib/api/use-api';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Hero',
  countdown: 'Countdown',
  timeline: 'Timeline / Cerita',
  events: 'Acara',
  gallery: 'Galeri',
  maps: 'Maps',
  video: 'Video',
  gift: 'Hadiah',
  rsvp: 'RSVP',
  wishes: 'Ucapan',
  faq: 'FAQ',
  contact: 'Kontak',
  sponsors: 'Sponsor',
  vendors: 'Vendor',
  stream: 'Live Stream',
  share: 'Bagikan',
};

const DEFAULT_DATA: Record<string, unknown> = {
  hero: { title: '' },
  countdown: {},
  timeline: { items: [] },
  events: { items: [] },
  gallery: {},
  maps: { items: [] },
  video: { youtubeId: '' },
  gift: {},
  rsvp: {},
  wishes: {},
  faq: { items: [] },
  contact: {},
  sponsors: { items: [] },
  vendors: { items: [] },
  stream: { platform: 'youtube', url: 'https://www.youtube.com/' },
  share: {},
};

function useAuthedMutation<TData, TVariables>(
  fn: (variables: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => {
      void queryClient.invalidateQueries();
    },
  });
}

export default function EventBuilderPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
}) {
  const { tenantId, eventId } = use(params);
  const { getToken } = useAuth();
  const [newBlock, setNewBlock] = useState<string>('hero');

  const eventQuery = useApiQuery<Event>(`/tenants/${tenantId}/events/${eventId}`);
  const sectionsQuery = useApiQuery<Section[]>(`/tenants/${tenantId}/events/${eventId}/sections`);

  const sections = sectionsQuery.data ?? [];
  const event = eventQuery.data;

  const authBody = async (
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown
  ) => {
    const token = await getToken();
    return apiFetch(path, { method, body, token });
  };

  const publish = useAuthedMutation<unknown, void>(async () => {
    const token = await getToken();
    return apiFetch(`/tenants/${tenantId}/events/${eventId}/publish`, { method: 'POST', token });
  });

  const unpublish = useAuthedMutation<unknown, void>(async () => {
    const token = await getToken();
    return apiFetch(`/tenants/${tenantId}/events/${eventId}/unpublish`, { method: 'POST', token });
  });

  const toggle = useAuthedMutation<unknown, { id: string; enabled: boolean }>(
    async ({ id, enabled }) =>
      authBody(`/tenants/${tenantId}/events/${eventId}/sections/${id}`, 'PATCH', { enabled })
  );

  const removeSection = useAuthedMutation<unknown, string>(async (id) =>
    authBody(`/tenants/${tenantId}/events/${eventId}/sections/${id}`, 'DELETE')
  );

  const addSection = useAuthedMutation<unknown, void>(async () =>
    authBody(`/tenants/${tenantId}/events/${eventId}/sections`, 'POST', {
      blockType: newBlock,
      data: DEFAULT_DATA[newBlock],
    })
  );

  const move = useAuthedMutation<unknown, { id: string; dir: -1 | 1 }>(
    async ({ id, dir }) => {
      const index = sections.findIndex((s) => s.id === id);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= sections.length) return;
      const next = [...sections];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return authBody(`/tenants/${tenantId}/events/${eventId}/sections/reorder`, 'POST', {
        orderedIds: next.map((s) => s.id),
      });
    }
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {event?.name ?? 'Undangan'}
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            {event ? `/invitation/${event.slug}` : ''} · {event?.status}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/tenants/${tenantId}/events/${eventId}/guests`}
            className="text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Tamu
          </Link>
          <Link
            href={`/admin/tenants/${tenantId}/events/${eventId}/gallery`}
            className="text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Galeri
          </Link>
          {event?.slug ? (
            <Link
              href={`/invitation/${event.slug}`}
              target="_blank"
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Lihat undangan ↗
            </Link>
          ) : null}
          {event?.status === 'published' ? (
            <Button variant="outline" size="sm" onClick={() => void unpublish.mutate()}>
              Turunkan
            </Button>
          ) : (
            <Button size="sm" onClick={() => void publish.mutate()}>
              Terbitkan
            </Button>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium text-foreground">Blok Halaman</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={newBlock}
            onChange={(e) => setNewBlock(e.target.value)}
            className="h-10 rounded-xl border border-foreground/15 bg-background px-3 text-sm"
          >
            {BLOCK_TYPES.map((type) => (
              <option key={type} value={type}>
                {BLOCK_LABELS[type] ?? type}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => void addSection.mutate()}>
            + Tambah Blok
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-sm text-foreground/50">
            Belum ada blok. Tambahkan blok pertama Anda di atas.
          </p>
        ) : (
          sections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center justify-between rounded-xl border border-foreground/10 bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-foreground/40">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {BLOCK_LABELS[section.blockType] ?? section.blockType}
                  </p>
                  <p className="text-xs text-foreground/50">v{section.schemaVersion}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Naikkan"
                  disabled={index === 0}
                  onClick={() => void move.mutate({ id: section.id, dir: -1 })}
                  className="rounded-md px-2 py-1 text-foreground/60 hover:bg-foreground/5 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  aria-label="Turunkan"
                  disabled={index === sections.length - 1}
                  onClick={() => void move.mutate({ id: section.id, dir: 1 })}
                  className="rounded-md px-2 py-1 text-foreground/60 hover:bg-foreground/5 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  aria-label={`${section.enabled ? 'Nonaktifkan' : 'Aktifkan'} blok`}
                  onClick={() => void toggle.mutate({ id: section.id, enabled: !section.enabled })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    section.enabled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-foreground/5 text-foreground/50'
                  }`}
                >
                  {section.enabled ? 'Aktif' : 'Nonaktif'}
                </button>
                <button
                  aria-label="Hapus blok"
                  onClick={() => void removeSection.mutate(section.id)}
                  className="rounded-md px-2 py-1 text-red-500 hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}