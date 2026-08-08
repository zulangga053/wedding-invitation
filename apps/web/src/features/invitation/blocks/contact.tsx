'use client';

import type { Invitation, Section } from '@momentia/shared';

export function ContactBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as {
    email?: string;
    phone?: string;
    address?: string;
    mapsUrl?: string;
  };

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Hubungi Kami
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        Kontak
      </h2>

      <div className="mx-auto mt-10 max-w-xl space-y-4 text-left">
        {data?.phone ? (
          <a
            href={`tel:${data.phone}`}
            className="block rounded-2xl bg-[var(--inv-surface)] p-6 shadow-sm"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--inv-primary)]">Telepon</p>
            <p className="mt-1 font-semibold text-[var(--inv-text)]">{data.phone}</p>
          </a>
        ) : null}
        {data?.email ? (
          <a
            href={`mailto:${data.email}`}
            className="block rounded-2xl bg-[var(--inv-surface)] p-6 shadow-sm"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--inv-primary)]">Email</p>
            <p className="mt-1 font-semibold text-[var(--inv-text)]">{data.email}</p>
          </a>
        ) : null}
        {data?.address ? (
          <div className="rounded-2xl bg-[var(--inv-surface)] p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-[var(--inv-primary)]">Alamat</p>
            <p className="mt-1 text-sm text-[var(--inv-text)]">{data.address}</p>
          </div>
        ) : null}
        {data?.mapsUrl ? (
          <a
            href={data.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-[var(--inv-surface)] p-6 shadow-sm"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--inv-primary)]">Peta</p>
            <p className="mt-1 text-sm text-[var(--inv-text)]">Buka di Google Maps</p>
          </a>
        ) : null}
      </div>
    </section>
  );
}
