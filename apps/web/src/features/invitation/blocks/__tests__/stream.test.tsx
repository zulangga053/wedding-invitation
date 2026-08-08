import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { StreamBlock } from '@/features/invitation/blocks/stream';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-stream',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'stream',
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

describe('StreamBlock', () => {
  it('renders nothing when url missing', () => {
    const { container } = render(
      <StreamBlock invitation={makeInvitation()} section={makeSection()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders default title when custom title absent', () => {
    render(
      <StreamBlock
        invitation={makeInvitation()}
        section={makeSection({ platform: 'zoom', url: 'https://zoom.us/j/123' })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Live Streaming' })).toBeInTheDocument();
  });

  it('renders custom title and join link from section data', () => {
    render(
      <StreamBlock
        invitation={makeInvitation()}
        section={makeSection({
          title: 'Siaran Akad',
          platform: 'youtube',
          url: 'https://youtube.com/watch?v=abc123',
          datetime: '2026-08-15T09:00:00.000Z',
        })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Siaran Akad' })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Tonton Live' });
    expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=abc123');
  });

  it('renders stream datetime', () => {
    render(
      <StreamBlock
        invitation={makeInvitation()}
        section={makeSection({
          url: 'https://zoom.us/j/123',
          datetime: '2026-08-15T09:00:00.000Z',
        })}
      />
    );
    expect(screen.getByText(/agustus 2026/i)).toBeInTheDocument();
  });
});
