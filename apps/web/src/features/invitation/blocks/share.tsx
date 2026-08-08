'use client';
import { useState } from 'react';
import type { Invitation } from '@momentia/shared';

const baseUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');

export function ShareBlock({ invitation }: { invitation: Invitation }) {
  const [copied, setCopied] = useState(false);
  const url = `${baseUrl}/invitation/${invitation.slug}`;
  const text = `Undangan ${invitation.name}`;
  const encode = (value: string) => encodeURIComponent(value);

  const links = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encode(text)}%20${encode(url)}`,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encode(text)}&url=${encode(url)}`,
    },
  ];

  async function copyLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="border-foreground/5 border-t px-6 py-14 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-muted)]">
        Bagikan Undangan
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/10 rounded-full border px-5 py-2.5 text-sm font-medium text-[var(--inv-text)] transition-colors hover:border-[var(--inv-primary)] hover:text-[var(--inv-primary)]"
          >
            {link.label}
          </a>
        ))}
        <div className="mt-4 flex">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="rounded-full bg-[var(--inv-primary)] px-5 py-2.5 text-sm font-medium text-white"
          >
            {copied ? 'Tersalin' : 'Salin Link'}
          </button>
        </div>
      </div>
    </section>
  );
}
