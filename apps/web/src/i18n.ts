export const locales = ['id', 'en'] as const;
export const defaultLocale = 'id';
export type Locale = (typeof locales)[number];

export const labels: Record<Locale, { name: string }> = {
  id: { name: 'Indonesia' },
  en: { name: 'English' },
};

export function getLocale(request: { headers: { get: (name: string) => string | null } }): Locale {
  const languages = request.headers.get('accept-language');
  if (!languages) return defaultLocale;
  const preferred = languages.split(',')[0]?.split('-')[0]?.toLowerCase();
  return (locales as readonly string[]).includes(preferred) ? (preferred as Locale) : defaultLocale;
}