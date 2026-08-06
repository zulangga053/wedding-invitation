export interface ThemeTokens {
  id: string;
  name: string;
  fontHeading: string;
  fontBody: string;
  palette: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    accent: string;
  };
}

export const THEMES: Record<string, ThemeTokens> = {
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    fontHeading: 'var(--font-cormorant)',
    fontBody: 'var(--font-inter)',
    palette: {
      bg: '#F8F5F1',
      surface: '#FFFFFF',
      text: '#1F1B16',
      muted: '#8A7F72',
      primary: '#B88A44',
      accent: '#D4AF37',
    },
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    fontHeading: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    palette: {
      bg: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#111827',
      muted: '#6B7280',
      primary: '#111827',
      accent: '#9CA3AF',
    },
  },
};

export function getTheme(id: string | undefined): ThemeTokens {
  return (id && THEMES[id]) || THEMES.minimalist;
}