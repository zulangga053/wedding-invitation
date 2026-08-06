'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import type { GalleryPhoto, Invitation, Section } from '@momentia/shared';
import { apiFetch } from '@/lib/api/client';

export function GalleryBlock({ invitation, section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string };
  const slug = invitation.slug;
  const [active, setActive] = useState<number | null>(null);

  const gallery = useQuery<GalleryPhoto[], Error>({
    queryKey: [slug, 'gallery'],
    queryFn: () => apiFetch<GalleryPhoto[]>(`/public/events/${slug}/gallery`),
  });

  const photos = gallery.data ?? [];

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  if (photos.length === 0) return null;

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Galeri
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Momen Kami'}
      </h2>

      <div className="mx-auto mt-10 columns-2 gap-3 md:columns-3 lg:columns-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative mb-3 block w-full overflow-hidden rounded-2xl bg-[var(--inv-surface)]"
            aria-label={photo.caption ?? 'Buka foto'}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.caption ?? 'Foto galeri'}
              width={600}
              height={800}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {photo.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {photo.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {active !== null && photos[active] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div className="relative max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[active].imageUrl}
              alt={photos[active].caption ?? 'Foto galeri'}
              width={1200}
              height={1600}
              className="max-h-[85vh] w-auto rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Tutup galeri"
              className="absolute -top-10 right-0 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white"
            >
              Tutup (Esc)
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}