import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(`${API_URL}/public/events/slugs`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    return (await response.json()) as { slug: string; updatedAt: string }[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();

  const invitationRoutes = slugs.map((item) => ({
    url: `${SITE_URL}/invitation/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/register`, changeFrequency: 'yearly', priority: 0.5 },
  ] as MetadataRoute.Sitemap;

  return [...staticRoutes, ...invitationRoutes];
}