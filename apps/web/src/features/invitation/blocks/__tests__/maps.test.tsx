import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { MapsBlock } from '@/features/invitation/blocks/maps';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-maps',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'maps',
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

describe('MapsBlock', () => {
  it('renders default title when section data is empty', () => {
    render(<MapsBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(screen.getByRole('heading', { name: 'Denah Lokasi' })).toBeInTheDocument();
  });

  it('renders custom title from section data', () => {
    render(
      <MapsBlock invitation={makeInvitation()} section={makeSection({ title: 'Peta Acara' })} />
    );
    expect(screen.getByRole('heading', { name: 'Peta Acara' })).toBeInTheDocument();
  });

  it('renders map item details', () => {
    render(
      <MapsBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [{ title: 'Masjid Agung', address: 'Jl. Merdeka No. 1' }],
        })}
      />
    );
    expect(screen.getByRole('heading', { name: 'Masjid Agung' })).toBeInTheDocument();
    expect(screen.getByText('Jl. Merdeka No. 1')).toBeInTheDocument();
  });

  it('renders Google Maps link when mapsUrl present', () => {
    render(
      <MapsBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [{ title: 'Masjid Agung', mapsUrl: 'https://maps.google.com/?q=Masjid' }],
        })}
      />
    );
    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute('href', 'https://maps.google.com/?q=Masjid');
  });

  it('omits Google Maps link when mapsUrl is missing', () => {
    render(
      <MapsBlock
        invitation={makeInvitation()}
        section={makeSection({ items: [{ title: 'Masjid Agung' }] })}
      />
    );
    expect(screen.queryByRole('link', { name: 'Buka di Google Maps' })).not.toBeInTheDocument();
  });
});
