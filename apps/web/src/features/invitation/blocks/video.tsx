'use client';

import { useState } from 'react';
import type { Invitation, Section } from '@momentia/shared';

export function VideoBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; youtubeId?: string; caption?: string };
  const youtubeId = data?.youtubeId;
  const [playing, setPlaying] = useState(false);

  if (!youtubeId) return null;

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Video
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Video Kami'}
      </h2>

      <div className="mx-auto mt-8 max-w-2xl">
        {playing ? (
          <iframe
            className="aspect-video w-full rounded-2xl"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={data?.caption ?? 'Video undangan'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="flex aspect-video w-full items-center justify-center rounded-2xl bg-[var(--inv-surface)] shadow-sm"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--inv-primary)] text-2xl text-white">
              ▶
            </span>
          </button>
        )}
      </div>
    </section>
  );
}