'use client';

import type { Invitation, Section } from '@momentia/shared';

type StreamData = {
  title?: string;
  platform?: 'zoom' | 'youtube' | 'other';
  url?: string;
  datetime?: string;
};

export function StreamBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as StreamData | null;
  const url = data?.url;

  if (!url) return null;

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Live Streaming
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Live Streaming'}
      </h2>

      <div className="mx-auto mt-8 max-w-md rounded-2xl bg-[var(--inv-surface)] px-6 py-10 shadow-sm">
        {data?.datetime && (
          <p className="text-sm text-[var(--inv-muted)]">
            {new Date(data.datetime).toLocaleString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full border border-[var(--inv-primary)] px-6 py-2.5 text-xs font-medium text-[var(--inv-primary)] transition-colors hover:bg-[var(--inv-primary)] hover:text-white"
        >
          Tonton Live
        </a>
      </div>
    </section>
  );
}
