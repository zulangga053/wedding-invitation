'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Invitation, Section } from '@momentia/shared';
import { apiFetch, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface WishPage {
  items: Wish[];
}

export function WishesBlock({ invitation }: { invitation: Invitation; section: Section }) {
  const slug = invitation.slug;
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const wishes = useQuery<WishPage, Error>({
    queryKey: [slug, 'wishes'],
    queryFn: () => apiFetch<WishPage>(`/public/events/${slug}/wishes?limit=60`),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/public/events/${slug}/wishes`, {
        method: 'POST',
        body: { eventSlug: slug, name, message, honeypot: '' },
      });
      setName('');
      setMessage('');
      void queryClient.invalidateQueries({ queryKey: [slug, 'wishes'] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim ucapan');
    } finally {
      setSubmitting(false);
    }
  }

  const items = wishes.data?.items ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Doa & Ucapan
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        Kirim Doa & Ucapan
      </h2>

      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl bg-[var(--inv-surface)] p-6 text-left shadow-sm"
      >
        <input
          placeholder="Nama Anda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm"
        />
        <textarea
          rows={3}
          placeholder="Tulis doa dan ucapan…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm"
        />
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting || !name.trim() || !message.trim()}>
          {submitting ? 'Mengirim…' : 'Kirim Ucapan'}
        </Button>
      </form>

      <div className="mx-auto mt-10 max-w-2xl space-y-3 text-left">
        {items.map((wish) => (
          <div key={wish.id} className="rounded-2xl bg-[var(--inv-surface)] p-5 shadow-sm">
            <p className="text-sm font-semibold text-[var(--inv-text)]">{wish.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--inv-muted)]">{wish.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}