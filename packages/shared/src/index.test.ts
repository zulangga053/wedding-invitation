import { describe, expect, it } from 'vitest';
import {
  BLOCK_DATA_SCHEMAS,
  EventCreateSchema,
  RsvpCreateSchema,
  SectionInputSchema,
  slugSchema,
  WishCreateSchema,
} from './index';

describe('slugSchema', () => {
  it('accepts valid slugs', () => {
    expect(slugSchema.safeParse('zul-angga').success).toBe(true);
    expect(slugSchema.safeParse('a').success).toBe(true);
    expect(slugSchema.safeParse('x-9').success).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(slugSchema.safeParse('ZulAngga').success).toBe(false);
    expect(slugSchema.safeParse('has space').success).toBe(false);
    expect(slugSchema.safeParse('-leading').success).toBe(false);
    expect(slugSchema.safeParse('trailing-').success).toBe(false);
  });
});

describe('EventCreateSchema', () => {
  const base = {
    type: 'wedding',
    slug: 'zul-angga',
    name: 'Zul & Angga',
    mainDate: '2026-11-14T02:00:00.000Z',
    language: 'id',
    themeId: 'luxury',
    hero: { mediaUrl: 'https://example.com/hero.jpg' },
    seo: { title: 'Undangan', description: 'Undangan pernikahan' },
  };

  it('validates a minimal wedding event', () => {
    expect(EventCreateSchema.safeParse(base).success).toBe(true);
  });

  it('rejects unknown event type', () => {
    const bad = { ...base, type: 'concert' };
    expect(EventCreateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('SectionInputSchema (block registry)', () => {
  it('validates hero block data', () => {
    const input = { blockType: 'hero', data: { title: 'Zul & Angga' } };
    const result = SectionInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects unknown block data shape', () => {
    const input = { blockType: 'video', data: { nope: true } };
    expect(SectionInputSchema.safeParse(input).success).toBe(false);
  });

  it('registry covers every supported block type', () => {
    const types = new Set(Object.keys(BLOCK_DATA_SCHEMAS));
    expect(types.size).toBeGreaterThanOrEqual(10);
  });
});

describe('public DTOs', () => {
  it('rejects RSVP with honeypot filled (bot)', () => {
    const rsvp = {
      eventSlug: 'zul-angga',
      guestName: 'Budi',
      attendance: 'yes',
      honeypot: 'i-am-a-bot',
    };
    expect(RsvpCreateSchema.safeParse(rsvp).success).toBe(false);
  });

  it('accepts a valid wish', () => {
    const wish = { eventSlug: 'zul-angga', name: 'Budi', message: 'Barakallahu lakuma' };
    expect(WishCreateSchema.safeParse(wish).success).toBe(true);
  });
});