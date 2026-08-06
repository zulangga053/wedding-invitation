import { z } from 'zod';
import { slugSchema, zEventStatus, zEventType, zLanguage } from '../enums';
import { HeroConfigSchema, HostSchema, MusicConfigSchema, SeoSchema, StreamConfigSchema } from './event';

/** Materialized read-model served to the public page (ADR-002). */
export const InvitationSchema = z.object({
  slug: slugSchema,
  eventId: z.string().min(1),
  tenantId: z.string().min(1),
  type: zEventType,
  status: zEventStatus,
  name: z.string().min(1).max(120),
  hosts: z.array(HostSchema).default([]),
  mainDate: z.string().datetime(),
  language: zLanguage,
  themeId: z.string().min(1),
  hero: HeroConfigSchema,
  seo: SeoSchema,
  music: MusicConfigSchema,
  stream: StreamConfigSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime(),
});
export type Invitation = z.infer<typeof InvitationSchema>;