import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { ContactBlock } from '@/features/invitation/blocks/contact';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-contact',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'contact',
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

describe('ContactBlock', () => {
  it('renders default heading when section data is empty', () => {
    render(<ContactBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(screen.getByRole('heading', { name: 'Kontak' })).toBeInTheDocument();
  });

  it('renders phone as tel link', () => {
    render(
      <ContactBlock
        invitation={makeInvitation()}
        section={makeSection({ phone: '081234567890' })}
      />
    );
    expect(screen.getByRole('link', { name: /081234567890/ })).toHaveAttribute(
      'href',
      'tel:081234567890'
    );
  });

  it('renders email as mailto link', () => {
    render(
      <ContactBlock invitation={makeInvitation()} section={makeSection({ email: 'hi@mail.com' })} />
    );
    expect(screen.getByRole('link', { name: /hi@mail.com/ })).toHaveAttribute(
      'href',
      'mailto:hi@mail.com'
    );
  });

  it('renders address text', () => {
    render(
      <ContactBlock
        invitation={makeInvitation()}
        section={makeSection({ address: 'Jl. Melati No. 5' })}
      />
    );
    expect(screen.getByText('Jl. Melati No. 5')).toBeInTheDocument();
  });

  it('renders Google Maps link when mapsUrl present', () => {
    render(
      <ContactBlock
        invitation={makeInvitation()}
        section={makeSection({ mapsUrl: 'https://maps.google.com/?q=Masjid' })}
      />
    );
    expect(screen.getByRole('link', { name: /Buka di Google Maps/ })).toHaveAttribute(
      'href',
      'https://maps.google.com/?q=Masjid'
    );
  });

  it('omits contact entries when data is absent', () => {
    render(
      <ContactBlock invitation={makeInvitation()} section={makeSection({ phone: undefined })} />
    );
    expect(screen.queryByRole('link', { name: 'Telepon' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Buka di Google Maps/ })).not.toBeInTheDocument();
  });
});
