import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Invitation, Section } from '@momentia/shared';
import { RsvpBlock } from '@/features/invitation/blocks/rsvp';
import { ApiError } from '@/lib/api/client';

vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const { apiFetch } = await import('@/lib/api/client');

function makeProps(): { invitation: Invitation; section: Section } {
  const invitation: Invitation = {
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
  const section: Section = {
    id: 'sec-rsvp',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'rsvp',
    data: {},
    schemaVersion: 1,
    order: 1,
    enabled: true,
  };
  return { invitation, section };
}

describe('RsvpBlock', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockResolvedValue({});
  });

  it('renders the RSVP form fields and submit button', () => {
    render(<RsvpBlock {...makeProps()} />);
    expect(screen.getByPlaceholderText('Nama Anda')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim konfirmasi/i })).toBeInTheDocument();
  });

  it('shows a validation error for an empty guest name', async () => {
    const user = userEvent.setup();
    render(<RsvpBlock {...makeProps()} />);

    await user.click(screen.getByRole('button', { name: /kirim konfirmasi/i }));

    expect(await screen.findByText(/Nama minimal 2 karakter/i)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('submits valid data and shows a thank-you message', async () => {
    const user = userEvent.setup();
    render(<RsvpBlock {...makeProps()} />);

    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Budi');
    await user.click(screen.getByRole('radio', { name: /hadir/i }));
    await user.click(screen.getByRole('button', { name: /kirim konfirmasi/i }));

    expect(await screen.findByText(/terima kasih/i)).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith(
      '/public/events/zul-amel/rsvp',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('surfaces the API error message when submission fails', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new ApiError('Terlalu banyak permintaan', 429));
    const user = userEvent.setup();
    render(<RsvpBlock {...makeProps()} />);

    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Siti');
    await user.click(screen.getByRole('button', { name: /kirim konfirmasi/i }));

    expect(await screen.findByText(/Terlalu banyak permintaan/i)).toBeInTheDocument();
  });
});
