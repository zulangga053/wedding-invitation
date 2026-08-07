import { describe, it, expect, vi, beforeEach, type ReactNode } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Invitation, Section } from '@momentia/shared';
import { WishesBlock } from '@/features/invitation/blocks/wishes';

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {},
}));

const { apiFetch } = await import('@/lib/api/client');

function makeInvitation(): Invitation {
  return {
    slug: 'zul-amel',
    eventId: 'ev-1',
    tenantId: 'tn-1',
    type: 'wedding',
    status: 'published',
    name: 'Zul & Amel',
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

function makeSection(): Section {
  return {
    id: 'sec-wish',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'wishes',
    data: {},
    schemaVersion: 1,
    order: 1,
    enabled: true,
  };
}

function renderWithClient(node: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe('WishesBlock', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [] });
  });

  it('renders existing wishes from the API', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      items: [
        { id: 'w1', name: 'Budi', message: 'Selamat ya!', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    });
    renderWithClient(<WishesBlock invitation={makeInvitation()} section={makeSection()} />);

    expect(await screen.findByText('Budi')).toBeInTheDocument();
    expect(screen.getByText('Selamat ya!')).toBeInTheDocument();
  });

  it('disables submit until both fields are filled', async () => {
    const user = userEvent.setup();
    renderWithClient(<WishesBlock invitation={makeInvitation()} section={makeSection()} />);

    const button = screen.getByRole('button', { name: /kirim ucapan/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Siti');
    await user.type(screen.getByPlaceholderText(/tulis doa/i), 'Barakallah');
    expect(button).toBeEnabled();
  });
});
