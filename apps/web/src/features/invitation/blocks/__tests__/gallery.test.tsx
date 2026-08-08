import { describe, it, expect, vi, type ReactNode } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { GalleryPhoto, Invitation, Section } from '@momentia/shared';
import { GalleryBlock } from '@/features/invitation/blocks/gallery';

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {},
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} {...props} />
  ),
}));

const { apiFetch } = await import('@/lib/api/client');

const photos: GalleryPhoto[] = [
  { id: 'p-1', url: 'https://example.com/a.jpg', caption: 'Momen 1' },
  { id: 'p-2', url: 'https://example.com/b.jpg', caption: 'Momen 2' },
];

const invitation = {
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
} as Invitation;

const section = {
  id: 'sec-gal',
  tenantId: 'tn-1',
  eventId: 'ev-1',
  blockType: 'gallery',
  schemaVersion: 1,
  order: 1,
  enabled: true,
  data: {},
} as Section;

function renderWithQuery(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe('GalleryBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValue(photos);
  });

  it('renders title and photo thumbnails', async () => {
    renderWithQuery(<GalleryBlock invitation={invitation} section={section} />);
    expect(await screen.findByRole('heading', { name: 'Momen Kami' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  it('returns null when there are no photos', async () => {
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { container } = renderWithQuery(
      <GalleryBlock invitation={invitation} section={section} />
    );
    await waitFor(() => {
      expect(container.querySelector('section')).toBeNull();
    });
  });
});
