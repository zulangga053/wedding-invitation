import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Invitation } from '@momentia/shared';
import { MusicPlayer } from '@/features/invitation/music-player';

function makeInvitation(overrides: Partial<Invitation> = {}): Invitation {
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
    music: { url: 'https://example.com/audio.mp3', autoplay: false, loop: true },
    stream: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when music is null', () => {
    const { container } = render(<MusicPlayer invitation={makeInvitation({ music: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders audio element with music URL', () => {
    render(<MusicPlayer invitation={makeInvitation()} />);
    const audio = screen.getByRole('audio') as HTMLAudioElement;
    expect(audio).toHaveAttribute('src', 'https://example.com/audio.mp3');
    expect(audio).toHaveAttribute('loop');
    expect(screen.getByRole('button', { name: 'Putar musik' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('plays music on first click and updates state', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer invitation={makeInvitation()} />);

    await user.click(screen.getByRole('button', { name: 'Putar musik' }));

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Jeda musik' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('pauses music on second click', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer invitation={makeInvitation()} />);

    await user.click(screen.getByRole('button', { name: 'Putar musik' }));
    await user.click(screen.getByRole('button', { name: 'Jeda musik' }));

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Putar musik' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
