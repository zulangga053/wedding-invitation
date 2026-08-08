import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { TimelineBlock } from '@/features/invitation/blocks/timeline';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-tl',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'timeline',
    data,
    schemaVersion: 1,
    order: 1,
    enabled: true,
  };
}

function makeInvitation(): Invitation {
  return {
    slug: 'zul-amel',
    eventId: 'ev-1',
    tenantId: 'tn-1',
    type: 'wedding',
    status: 'published',
    name: 'Zul Amel',
    hosts: [],
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

describe('TimelineBlock', () => {
  it('renders default title when section data empty', () => {
    render(<TimelineBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(screen.getByRole('heading', { name: 'Perjalanan Cinta' })).toBeInTheDocument();
  });

  it('renders custom title from section data', () => {
    render(
      <TimelineBlock invitation={makeInvitation()} section={makeSection({ title: 'Kisah Kami' })} />
    );
    expect(screen.getByRole('heading', { name: 'Kisah Kami' })).toBeInTheDocument();
  });

  it('renders timeline items with date, title and description', () => {
    render(
      <TimelineBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [
            { title: 'Pertemuan Pertama', date: '2019', description: 'Bertemu di kampus' },
            { title: 'Lamaran', date: '2025', description: 'Prosesi lamaran keluarga' },
          ],
        })}
      />
    );
    expect(screen.getByText('2019')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pertemuan Pertama' })).toBeInTheDocument();
    expect(screen.getByText('Bertemu di kampus')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Lamaran' })).toBeInTheDocument();
    expect(screen.getByText('Prosesi lamaran keluarga')).toBeInTheDocument();
  });
});
