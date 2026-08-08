import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Invitation, Section } from '@momentia/shared';
import { VideoBlock } from '@/features/invitation/blocks/video';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-vd',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'video',
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

describe('VideoBlock', () => {
  it('renders nothing when youtubeId missing', () => {
    const { container } = render(
      <VideoBlock invitation={makeInvitation()} section={makeSection()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders default title when no custom title', () => {
    render(
      <VideoBlock invitation={makeInvitation()} section={makeSection({ youtubeId: 'abc123' })} />
    );
    expect(screen.getByRole('heading', { name: 'Video Kami' })).toBeInTheDocument();
  });

  it('renders custom title from section data', () => {
    render(
      <VideoBlock
        invitation={makeInvitation()}
        section={makeSection({ title: 'Trailer', youtubeId: 'abc123' })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Trailer' })).toBeInTheDocument();
  });

  it('embeds iframe only after play button clicked', async () => {
    const user = userEvent.setup();
    render(
      <VideoBlock
        invitation={makeInvitation()}
        section={makeSection({ youtubeId: 'abc123', caption: 'Video sambutan' })}
      />
    );

    expect(screen.queryByTitle('Video sambutan')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    const iframe = screen.getByTitle('Video sambutan');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc123?autoplay=1&rel=0'
    );
  });
});
