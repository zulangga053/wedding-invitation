'use client';

import type { Invitation, Section } from '@momentia/shared';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqBlock({ section }: { invitation: Invitation; section: Section }) {
  const data = section.data as { title?: string; items?: FaqItem[] };
  const items = data?.items ?? [];

  return (
    <section className="px-6 py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--inv-primary)]">
        Pertanyaan Umum
      </p>
      <h2
        style={{ fontFamily: 'var(--inv-font-heading)' }}
        className="mt-3 text-3xl font-semibold text-[var(--inv-text)]"
      >
        {data?.title ?? 'FAQ'}
      </h2>

      <div className="mx-auto mt-10 max-w-2xl space-y-4 text-left">
        {items.map((item, index) => (
          <details key={index} className="rounded-2xl bg-[var(--inv-surface)] p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold text-[var(--inv-text)]">
              {item.question}
            </summary>
            <p className="mt-3 text-sm text-[var(--inv-muted)]">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
