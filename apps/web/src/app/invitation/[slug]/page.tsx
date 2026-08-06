import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Invitation, Section } from '@momentia/shared';
import { API_URL } from '@/lib/api/client';
import { InvitationView } from '@/features/invitation/invitation-view';

export const revalidate = 60;

async function fetchInvitation(slug: string): Promise<{ invitation: Invitation; sections: Section[] }> {
  const response = await fetch(`${API_URL}/public/events/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) throw new Error('not_found');
  return (await response.json()) as { invitation: Invitation; sections: Section[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { invitation } = await fetchInvitation(slug);
    return {
      title: invitation.seo.title || invitation.name,
      description: invitation.seo.description,
      openGraph: {
        title: invitation.seo.title || invitation.name,
        description: invitation.seo.description,
        images: invitation.seo.ogImage ? [invitation.seo.ogImage] : undefined,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: invitation.seo.title || invitation.name,
        description: invitation.seo.description,
      },
    };
  } catch {
    return { title: 'Undangan', robots: { index: false } };
  }
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let payload: { invitation: Invitation; sections: Section[] };
  try {
    payload = await fetchInvitation(slug);
  } catch {
    notFound();
  }
  return <InvitationView invitation={payload.invitation} sections={payload.sections} />;
}