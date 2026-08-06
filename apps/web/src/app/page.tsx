'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  }),
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-secondary">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Momentia
        </span>
        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Masuk
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="text-sm font-medium uppercase tracking-[0.3em] text-brand-primary"
        >
          Undangan Digital Premium
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.15}
          className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl"
        >
          Sebarkan kebahagiaan momen terbaik Anda
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.3}
          className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/70"
        >
          Buat undangan digital elegan untuk pernikahan, aqiqah, ulang tahun, dan acara lainnya —
          lengkap dengan RSVP, galeri, ucapan, dan analitik.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.45}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="rounded-full bg-brand-dark px-8 py-4 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Mulai Undangan Anda
          </Link>
        </motion.div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-foreground/50">
        © {new Date().getFullYear()} Momentia. Undangan digital untuk setiap momen.
      </footer>
    </div>
  );
}