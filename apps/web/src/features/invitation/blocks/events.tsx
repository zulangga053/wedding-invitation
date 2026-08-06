'use client';

import type { Invitation, Section } from '@momentia/shared';

interface EventItem {
  type?: string;
  name: string;
  date: string;
  time?: string;
  venueName?: string;
  venueAddress?: string;
  mapsUrl?: string;
  dressCode?: string;
  description?: string;
}

export function EventsBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; items?: EventItem[] };
  const items = data?.items ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Rangkaian Acara
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Jadwal Acara'}
      </h2>

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-[var(--inv-surface)] p-6 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--inv-primary)]">
              {item.type}
            </p>
            <h3
              style={{ fontFamily: 'var(--inv-font-heading)' }}
              className="mt-2 text-2xl font-semibold text-[var(--inv-text)]"
            >
              {item.name}
            </h3>
            <p className="mt-3 text-sm text-[var(--inv-text)]">
              {item.date}
              {item.time ? ` · ${item.time}` : ''}
            </p>
            {item.venueName ? (
              <p className="mt-1 text-sm text-[var(--inv-muted)]">{item.venueName}</p>
            ) : null}
            {item.venueAddress ? (
              <p className="text-sm text-[var(--inv-muted)]">{item.venueAddress}</p>
            ) : null}
            {item.dressCode ? (
              <p className="mt-2 text-xs text-[var(--inv-muted)]">Dress code: {item.dressCode}</p>
            ) : null}
            {item.mapsUrl ? (
              <a
                href={item.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full border border-[var(--inv-primary)] px-5 py-2 text-xs font-medium text-[var(--inv-primary)] transition-colors hover:bg-[var(--inv-primary)] hover:text-white"
              >
                Buka di Google Maps
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}