'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Invitation, Section } from '@momentia/shared';
import { apiFetch, ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

const schema = z.object({
  guestName: z.string().min(2, 'Nama minimal 2 karakter'),
  attendance: z.enum(['yes', 'no', 'maybe']),
  guestCount: z.coerce.number().int().min(1).max(20).default(1),
  message: z.string().max(1000).optional(),
  honeypot: z.string().max(0).optional(),
});
type Values = z.infer<typeof schema>;

export function RsvpBlock({ invitation, section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; description?: string };
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { attendance: 'yes', guestCount: 1 } });

  async function onSubmit(values: Values) {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/public/events/${invitation.slug}/rsvp`, {
        method: 'POST',
        body: {
          eventSlug: invitation.slug,
          guestName: values.guestName,
          attendance: values.attendance,
          guestCount: values.guestCount,
          message: values.message ?? '',
          honeypot: values.honeypot ?? '',
        },
      });
      reset();
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim RSVP');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="rsvp" className="scroll-mt-8 px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        RSVP
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Konfirmasi Kehadiran'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--inv-muted)]">
        {data?.description ?? 'Mohon konfirmasi kehadiran Anda sebelum tanggal acara.'}
      </p>

      {done ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[var(--inv-surface)] p-6 text-sm text-[var(--inv-text)] shadow-sm">
          Terima kasih! Kehadiran Anda telah kami catat.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto mt-8 max-w-md space-y-4 rounded-2xl bg-[var(--inv-surface)] p-6 text-left shadow-sm"
        >
          <input type="text" hidden aria-hidden tabIndex={-1} autoComplete="off" {...register('honeypot')} />
          <div>
            <input
              placeholder="Nama Anda"
              className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm"
              {...register('guestName')}
            />
            {errors.guestName ? <p className="mt-1 text-xs text-red-500">{errors.guestName.message}</p> : null}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['yes', 'no', 'maybe'] as const).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-foreground/15 px-2 py-2.5 text-sm capitalize has-[:checked]:border-[var(--inv-primary)] has-[:checked]:bg-[var(--inv-primary)] has-[:checked]:text-white"
              >
                <input type="radio" value={value} className="sr-only" {...register('attendance')} />
                {value === 'yes' ? 'Hadir' : value === 'no' ? 'Berhalangan' : 'Ragu'}
              </label>
            ))}
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={20}
              placeholder="Jumlah tamu"
              className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-4 text-sm"
              {...register('guestCount')}
            />
          </div>
          <div>
            <textarea
              rows={3}
              placeholder="Pesan (opsional)"
              className="w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm"
              {...register('message')}
            />
          </div>
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim Konfirmasi'}
          </Button>
        </form>
      )}
    </section>
  );
}