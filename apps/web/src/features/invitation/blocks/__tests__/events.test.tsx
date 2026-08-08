import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { EventsBlock } from '@/features/invitation/blocks/events';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-ev',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'events',
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

describe('EventsBlock', () => {
  it('renders default title when section data is empty', () => {
    render(<EventsBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(screen.getByRole('heading', { name: 'Jadwal Acara' })).toBeInTheDocument();
  });

  it('renders custom title from section data', () => {
    render(
      <EventsBlock
        invitation={makeInvitation()}
        section={makeSection({ title: 'Resepsi Malam' })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Resepsi Malam' })).toBeInTheDocument();
  });

  it('renders event item details', () => {
    render(
      <EventsBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [
            {
              type: 'Akad',
              name: 'Akad Nikah',
              date: '15 Agustus 2026',
              time: '09:00',
              venueName: 'Masjid Agung',
              venueAddress: 'Jl. Merdeka No. 1',
              dressCode: 'Putih',
            },
          ],
        })}
      />
    );
    expect(screen.getByText('Akad')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Akad Nikah' })).toBeInTheDocument();
    expect(screen.getByText(/15 Agustus 2026/)).toBeInTheDocument();
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText('Masjid Agung')).toBeInTheDocument();
    expect(screen.getByText('Jl. Merdeka No. 1')).toBeInTheDocument();
    expect(screen.getByText(/Dress code: Putih/)).toBeInTheDocument();
  });

  it('renders Google Maps link when mapsUrl is present', () => {
    render(
      <EventsBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [
            {
              type: 'Resepsi',
              name: 'Resepsi',
              date: '15 Agustus 2026',
              mapsUrl: 'https://maps.google.com/?q=Masjid',
            },
          ],
        })}
      />
    );
    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=Masjid'
    );
  });

  it('omits Google Maps link when mapsUrl is missing', () => {
    render(
      <EventsBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [{ type: 'Resepsi', name: 'Resepsi', date: '15 Agustus 2026' }],
        })}
      />
    );
    expect(screen.queryByRole('link', { name: 'Buka Google Maps' })).not.toBeInTheDocument();
  });
});
