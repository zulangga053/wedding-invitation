'use client';

import type { CSSProperties } from 'react';
import type { Invitation, Section } from '@momentia/shared';
import { getTheme } from './themes';
import { HeroBlock } from './blocks/hero';
import { CountdownBlock } from './blocks/countdown';
import { EventsBlock } from './blocks/events';
import { TimelineBlock } from './blocks/timeline';
import { GalleryBlock } from './blocks/gallery';
import { VideoBlock } from './blocks/video';
import { RsvpBlock } from './blocks/rsvp';
import { WishesBlock } from './blocks/wishes';
import { GiftBlock } from './blocks/gift';
import { ShareBlock } from './blocks/share';
import { MapsBlock } from './blocks/maps';
import { FaqBlock } from './blocks/faq';
import { ContactBlock } from './blocks/contact';
import { StreamBlock } from './blocks/stream';
import { MusicPlayer } from './music-player';

interface BlockProps {
  invitation: Invitation;
  section: Section;
}

const BLOCK_MAP: Partial<
  Record<Section['blockType'], (props: BlockProps) => React.ReactElement | null>
> = {
  countdown: CountdownBlock,
  events: EventsBlock,
  timeline: TimelineBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  rsvp: RsvpBlock,
  wishes: WishesBlock,
  gift: GiftBlock,
  share: ShareBlock,
  maps: MapsBlock,
  faq: FaqBlock,
  contact: ContactBlock,
  stream: StreamBlock,
};

export function InvitationView({
  invitation,
  sections,
}: {
  invitation: Invitation;
  sections: Section[];
}) {
  const theme = getTheme(invitation.themeId);
  const vars = {
    '--inv-bg': theme.palette.bg,
    '--inv-surface': theme.palette.surface,
    '--inv-text': theme.palette.text,
    '--inv-muted': theme.palette.muted,
    '--inv-primary': theme.palette.primary,
    '--inv-accent': theme.palette.accent,
    '--inv-font-heading': theme.fontHeading,
    '--inv-font-body': theme.fontBody,
  } as CSSProperties;

  return (
    <div
      style={{ ...vars, fontFamily: 'var(--inv-font-body)' }}
      className="min-h-screen bg-[var(--inv-bg)] text-[var(--inv-text)]"
    >
      <HeroBlock invitation={invitation} />
      {sections
        .filter((section) => section.enabled && section.blockType !== 'hero')
        .map((section) => {
          const Block = BLOCK_MAP[section.blockType];
          return Block ? (
            <Block key={section.id} invitation={invitation} section={section} />
          ) : null;
        })}
      <MusicPlayer invitation={invitation} />
    </div>
  );
}
