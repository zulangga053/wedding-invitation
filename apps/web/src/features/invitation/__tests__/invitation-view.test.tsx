import { describe, it, expect, vi, type ReactNode } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { InvitationView } from '@/features/invitation/invitation-view';

vi.mock('framer-motion', () => ({
  motion: {
    p: ({ children, ...props }: { children?: ReactNode }) => (
      <p data-mock="true" {...props}>
        {children}
      </p>
    ),
    h1: ({ children, ...props }: { children?: ReactNode }) => (
      <h1 data-mock="true" {...props}>
        {children}
      </h1>
    ),
    a: ({ children, ...props }: { children?: ReactNode }) => (
      <a data-mock="true" {...props}>
        {children}
      </a>
    ),
  },
}));

function makeInvitation(): Invitation {
  return {
    slug: 'zul-amel',
    eventId: 'ev-1',
    tenantId: 'tn-1',
    type: 'wedding',
    status: 'published',
    name: 'Zul Amel',
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
  };
}

function makeSection(
  id: string,
  blockType: Section['blockType'],
  data: Section['data'] = {},
  enabled = true
): Section {
  return {
    id,
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType,
    data,
    schemaVersion: 1,
    order: 1,
    enabled,
  };
}

describe('InvitationView', () => {
  it('renders hero and all enabled blocks', () => {
    const sections = [
      makeSection('sec-cd', 'countdown', { targetDate: '2099-01-01T00:00:00.000Z' }),
      makeSection('sec-ev', 'events', {
        items: [{ type: 'Akad', name: 'Akad Nikah', date: '15 Agustus 2026' }],
      }),
      makeSection('sec-tl', 'timeline', {
        items: [{ title: 'Pertemuan Pertama', date: '2019', description: 'Bertemu di kampus' }],
      }),
      makeSection('sec-vd', 'video', { youtubeId: 'abc123' }),
      makeSection('sec-sh', 'share'),
    ];

    render(<InvitationView invitation={makeInvitation()} sections={sections} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Zul & Amel');
    expect(screen.getByRole('heading', { name: 'Menghitung Hari' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Akad Nikah' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pertemuan Pertama' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Video Kami' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument();
  });

  it('skips disabled sections', () => {
    const sections = [
      makeSection('sec-sh', 'share'),
      makeSection('sec-ev', 'events', { title: 'Tersembunyi' }, false),
    ];

    render(<InvitationView invitation={makeInvitation()} sections={sections} />);

    expect(screen.queryByRole('heading', { name: 'Tersembunyi' })).not.toBeInTheDocument();
  });

  it('applies theme CSS variables on wrapper', () => {
    const { container } = render(
      <InvitationView invitation={makeInvitation()} sections={[makeSection('sec-sh', 'share')]} />
    );

    const root = container.firstChild as HTMLElement;
    expect(root.style.getPropertyValue('--inv-bg')).toBe('#F8F5F1');
    expect(root.style.getPropertyValue('--inv-primary')).toBe('#B88A44');
  });

  it('does not render music player when music is null', () => {
    render(<InvitationView invitation={makeInvitation()} sections={[]} />);
    expect(screen.queryByRole('button', { name: 'Putar musik' })).not.toBeInTheDocument();
  });
});
