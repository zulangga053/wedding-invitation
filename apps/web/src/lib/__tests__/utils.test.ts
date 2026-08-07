import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (class merge utility)', () => {
  it('merges simple strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { on: true, off: false })).toBe('base on');
  });

  it('resolves conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2 px-4')).toBe('px-4');
    expect(cn('text-red-500 text-blue-600')).toBe('text-blue-600');
  });
});
