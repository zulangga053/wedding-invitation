'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Gift, Invitation, Section } from '@momentia/shared';
import { apiFetch, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

export function GiftBlock({ invitation, section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; description?: string };
  const slug = invitation.slug;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState<Record<string, string>>({});

  const gifts = useQuery<Gift[], Error>({
    queryKey: [slug, 'gifts'],
    queryFn: () => apiFetch<Gift[]>(`/public/events/${slug}/gifts`),
  });

  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  }

  async function confirm(giftId: string, name: string) {
    if (!name.trim()) return;
    try {
      await apiFetch(`/public/events/${slug}/gifts/${giftId}/confirm`, {
        method: 'POST',
        body: { eventSlug: slug, giftId, name, honeypot: '' },
      });
      setConfirmName((prev) => ({ ...prev, [giftId]: '' }));
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
    }
  }

  const items = gifts.data ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Tanda Kasih
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Hadiah Pernikahan'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--inv-muted)]">
        {data?.description ??
          'Doa dan kehadiran Anda adalah hadiah terbaik. Namun jika memberi tanda kasih, berikut pilihannya.'}
      </p>

      <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
        {items.map((gift) => (
          <div key={gift.id} className="rounded-2xl bg-[var(--inv-surface)] p-6 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--inv-primary)]">
              {gift.type === 'bank' ? gift.bankName ?? 'Transfer' : 'QRIS'}
            </p>
            <h3
              style={{ fontFamily: 'var(--inv-font-heading)' }}
              className="mt-2 text-xl font-semibold text-[var(--inv-text)]"
            >
              {gift.label}
            </h3>

            {gift.type === 'bank' && gift.accountNumber ? (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-foreground/10 px-4 py-3">
                <div>
                  <p className="text-xs text-[var(--inv-muted)]">Nomor Rekening</p>
                  <p className="text-base font-semibold tabular-nums text-[var(--inv-text)]">
                    {gift.accountNumber}
                  </p>
                  {gift.accountHolder ? (
                    <p className="text-xs text-[var(--inv-muted)]">a.n. {gift.accountHolder}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void copy(gift.accountNumber!, gift.id)}
                  className="rounded-full bg-[var(--inv-primary)] px-4 py-2 text-xs font-medium text-white"
                >
                  {copiedId === gift.id ? 'Tersalin ✓' : 'Salin'}
                </button>
              </div>
            ) : null}

            {gift.type === 'qris' && gift.qrisImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gift.qrisImageUrl}
                alt={gift.label}
                className="mt-4 w-40 rounded-xl bg-white p-2"
              />
            ) : null}

            <div className="mt-4 flex gap-2">
              <input
                placeholder="Nama pengirim"
                value={confirmName[gift.id] ?? ''}
                onChange={(e) =>
                  setConfirmName((prev) => ({ ...prev, [gift.id]: e.target.value }))
                }
                className="h-10 flex-1 rounded-xl border border-foreground/15 bg-background px-3 text-sm"
              />
              <Button size="sm" variant="outline" onClick={() => void confirm(gift.id, confirmName[gift.id] ?? '')}>
                Konfirmasi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}