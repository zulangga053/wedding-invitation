'use client';

import { useEffect, useState } from 'react';
import type { Invitation, Section } from '@momentia/shared';

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

function split(ms: number): TimeLeft {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function Diff({ invitation, section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; targetDate?: string };
  const target = data?.targetDate ?? invitation.mainDate;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [time, setTime] = useState<TimeLeft>(() =>
    split(new Date(target).getTime() - new Date().getTime())
  );

  useEffect(() => {
    if (!isClient) return;
    const id = setInterval(() => {
      setTime(split(new Date(target).getTime() - new Date().getTime()));
    }, 1000);
    return () => clearInterval(id);
  }, [target, isClient]);

  const units = [
    { label: 'Hari', value: time.d },
    { label: 'Jam', value: time.h },
    { label: 'Menit', value: time.m },
    { label: 'Detik', value: time.s },
  ];

  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="w-20 rounded-2xl bg-[var(--inv-surface)] py-5 text-center shadow-sm sm:w-24"
        >
          <div
            className="text-3xl font-semibold tabular-nums text-[var(--inv-primary)]"
            suppressHydrationWarning
          >
            {isClient ? String(unit.value).padStart(2, '0') : '00'}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-[var(--inv-muted)]">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CountdownBlock({
  invitation,
  section,
}: {
  invitation: Invitation;
  section: Section;
}) {
  const data = section.data as { title?: string };
  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Menuju Hari Bahagia
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'Menghitung Hari'}
      </h2>
      <div className="mt-8">
        <Diff invitation={invitation} section={section} />
      </div>
    </section>
  );
}
