import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation } from '@momentia/shared';
import { HeroBlock } from '@/features/invitation/blocks/hero';

vi.mock('framer-motion', () => ({
  motion: {
    p: ({ children, ...props }: { children?: React.ReactNode }) => (
      <p data-mock="true" {...props}>
        {children}
      </p>
    ),
    h1: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h1 data-mock="true" {...props}>
        {children}
      </h1>
    ),
    a: ({ children, ...props }: { children?: React.ReactNode }) => (
      <a data-mock="true" {...props}>
        {children}
      </a>
    ),
  },
}));

function makeInvitation(overrides: Partial<Invitation> = {}): Invitation {
  return {
    slug: 'zul-amel',
    eventId: 'ev-1',
    tenantId: 'tn-1',
    type: 'wedding',
    status: 'published',
    name: 'Zul & Amel',
    hosts: [
      { name: 'Zul', nickname: 'Zul' },
      { name: 'Amel', nickname: 'Amel' },
    ],
    mainDate: '2026-08-15T09:00:00.000Z',
    language: 'id',
    themeId: 'luxury',
    hero: { mediaType: 'image', mediaUrl: 'https://example.com/x.jpg', overlay: 0.4 },
    seo: { title: '', description: '' },
    music: null,
    stream: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('HeroBlock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders host names joined with "&"', () => {
    render(<HeroBlock invitation={makeInvitation()} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Zul & Amel');
  });

  it('falls back to invitation name when hosts are empty', () => {
    render(<HeroBlock invitation={makeInvitation({ hosts: [] })} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Zul & Amel');
  });

  it('renders the CTA link pointing to the RSVP section', () => {
    render(<HeroBlock invitation={makeInvitation()} />);
    const cta = screen.getByRole('link', { name: /kirim ucapan & konfirmasi/i });
    expect(cta).toHaveAttribute('href', '#rsvp');
  });
});
