import { describe, it, expect, vi, type ReactNode } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Gift, Invitation, Section } from '@momentia/shared';
import { GiftBlock } from '@/features/invitation/blocks/gift';

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
    id: 'sec-gift',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'gift',
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

describe('GiftBlock', () => {
  it('renders bank gift details and copy button', async () => {
    const gifts: Gift[] = [
      {
        id: 'g1',
        tenantId: 'tn-1',
        eventId: 'ev-1',
        type: 'bank',
        label: 'BCA',
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'Zul & Amel',
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    vi.mocked(apiFetch).mockResolvedValue(gifts);

    renderWithClient(<GiftBlock invitation={makeInvitation()} section={makeSection()} />);

    expect((await screen.findAllByText('BCA')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salin/i })).toBeInTheDocument();
  });

  it('shows default title when no custom title is set', async () => {
    vi.mocked(apiFetch).mockResolvedValue([]);
    renderWithClient(<GiftBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(await screen.findByRole('heading', { name: /hadiah pernikahan/i })).toBeInTheDocument();
  });
});
