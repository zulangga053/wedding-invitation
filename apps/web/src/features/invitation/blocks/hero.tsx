'use client';

import { motion } from 'framer-motion';
import type { Invitation } from '@momentia/shared';

export function HeroBlock({ invitation }: { invitation: Invitation }) {
  const hosts = invitation.hosts.map((h) => h.name).join(' & ') || invitation.name;
  const date = new Date(invitation.mainDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--inv-surface)] via-[var(--inv-bg)] to-[var(--inv-bg)]" />
      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--inv-primary)]"
        >
          The Wedding Of
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          style={{ fontFamily: 'var(--inv-font-heading)' }}
          className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-[var(--inv-text)] sm:text-6xl md:text-7xl"
        >
          {hosts}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-sm font-medium uppercase tracking-[0.25em] text-[var(--inv-muted)]"
        >
          {date}
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          href="#rsvp"
          className="mt-10 rounded-full bg-[var(--inv-primary)] px-8 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Kirim Ucapan & Konfirmasi
        </motion.a>
      </div>
    </section>
  );
}