'use client';

import type { Invitation, Section } from '@momentia/shared';

interface TimelineItem {
  title: string;
  date: string;
  description?: string;
  imageUrl?: string;
}

export function TimelineBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; items?: TimelineItem[] };
  const items = data?.items ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Kisah Kami
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Perjalanan Cinta'}
      </h2>

      <div className="mx-auto mt-12 max-w-xl">
        {items.map((item, index) => (
          <div key={index} className="relative flex gap-6 pb-12 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3 w-3 rounded-full bg-[var(--inv-primary)]" />
              {index < items.length - 1 ? (
                <span className="w-px flex-1 bg-[var(--inv-primary)]/30" />
              ) : null}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--inv-accent)]">
                {item.date}
              </p>
              <h3
                style={{ fontFamily: 'var(--inv-font-heading)' }}
                className="mt-1 text-xl font-semibold text-[var(--inv-text)]"
              >
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-[var(--inv-muted)]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}