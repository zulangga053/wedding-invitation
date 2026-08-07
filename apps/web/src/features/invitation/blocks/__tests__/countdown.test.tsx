import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { CountdownBlock } from '@/features/invitation/blocks/countdown';

function makeProps(targetDate?: string): { invitation: Invitation; section: Section } {
  return {
    invitation: {
      slug: 'zul-amel',
      eventId: 'ev-1',
      tenantId: 'tn-1',
      type: 'wedding',
      status: 'published',
      name: 'Zul & Amel',
      hosts: [],
      mainDate: '2099-01-01T00:00:00.000Z',
      language: 'id',
      themeId: 'luxury',
      hero: { mediaType: 'image', mediaUrl: 'https://example.com/x.jpg', overlay: 0.4 },
      seo: { title: '', description: '' },
      music: null,
      stream: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    section: {
      id: 'sec-cd',
      tenantId: 'tn-1',
      eventId: 'ev-1',
      blockType: 'countdown',
      data: targetDate ? { targetDate } : {},
      schemaVersion: 1,
      order: 1,
      enabled: true,
    },
  };
}

describe('CountdownBlock', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders all four time unit labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    render(<CountdownBlock {...makeProps('2026-01-03T00:00:00.000Z')} />);
    expect(screen.getByText('Hari')).toBeInTheDocument();
    expect(screen.getByText('Jam')).toBeInTheDocument();
    expect(screen.getByText('Menit')).toBeInTheDocument();
    expect(screen.getByText('Detik')).toBeInTheDocument();
  });

  it('uses the default title when section data has none', () => {
    render(<CountdownBlock {...makeProps()} />);
    expect(screen.getByRole('heading', { name: /menghitung hari/i })).toBeInTheDocument();
  });

  it('renders a custom title from section data', () => {
    const { invitation } = makeProps();
    const section: Section = {
      id: 'sec-cd',
      tenantId: 'tn-1',
      eventId: 'ev-1',
      blockType: 'countdown',
      data: { title: 'Hitung Mundur' },
      schemaVersion: 1,
      order: 1,
      enabled: true,
    };
    render(<CountdownBlock invitation={invitation} section={section} />);
    expect(screen.getByRole('heading', { name: /hitung mundur/i })).toBeInTheDocument();
  });

  it('renders a positive remaining time when target is in the future', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    render(<CountdownBlock {...makeProps('2026-01-11T00:00:00.000Z')} />);
    // Exactly 10 days remaining
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders all zeros after the target date has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    render(<CountdownBlock {...makeProps('2020-01-01T00:00:00.000Z')} />);
    const zeros = screen.getAllByText('00');
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
