import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Invitation, Section } from '@momentia/shared';
import { FaqBlock } from '@/features/invitation/blocks/faq';

function makeSection(data: Section['data'] = {}): Section {
  return {
    id: 'sec-faq',
    tenantId: 'tn-1',
    eventId: 'ev-1',
    blockType: 'faq',
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

describe('FaqBlock', () => {
  it('renders default title when section data is empty', () => {
    render(<FaqBlock invitation={makeInvitation()} section={makeSection()} />);
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('renders custom title from section data', () => {
    render(
      <FaqBlock invitation={makeInvitation()} section={makeSection({ title: 'Tanya Jawab' })} />
    );
    expect(screen.getByRole('heading', { name: 'Tanya Jawab' })).toBeInTheDocument();
  });

  it('renders question and answer for each item', () => {
    render(
      <FaqBlock
        invitation={makeInvitation()}
        section={makeSection({
          items: [
            { question: 'Apakah ada dress code?', answer: 'Tidak, tetap sopan.' },
            { question: 'Boleh bawa anak?', answer: 'Silakan.' },
          ],
        })}
      />
    );
    expect(screen.getByText('Apakah ada dress code?')).toBeInTheDocument();
    expect(screen.getByText('Tidak, tetap sopan.')).toBeInTheDocument();
    expect(screen.getByText('Boleh bawa anak?')).toBeInTheDocument();
    expect(screen.getByText('Silakan.')).toBeInTheDocument();
  });

  it('renders no items when list is empty', () => {
    render(<FaqBlock invitation={makeInvitation()} section={makeSection({ items: [] })} />);
    expect(screen.queryByText(/dress code/)).not.toBeInTheDocument();
  });
});
