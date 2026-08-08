'use client';

import type { Invitation, Section } from '@momentia/shared';

interface MapItem {
  title: string;
  address?: string;
  mapsUrl?: string;
}

export function MapsBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; items?: MapItem[] };
  const items = data?.items ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Lokasi Acara
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Denah Lokasi'}
      </h2>

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-[var(--inv-surface)] p-6 text-left shadow-sm">
            <h3
              style={{ fontFamily: 'var(--inv-font-heading)' }}
              className="mt-2 text-xl font-semibold text-[var(--inv-text)]"
            >
              {item.title}
            </h3>
            {item.address ? (
              <p className="mt-1 text-sm text-[var(--inv-muted)]">{item.address}</p>
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
