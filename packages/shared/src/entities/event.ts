import { z } from 'zod';
import {
  slugSchema,
  zEventStatus,
  zEventType,
  zLanguage,
  zMediaType,
  zStreamPlatform,
} from '../enums';

export const HostSchema = z.object({
  name: z.string().min(1).max(80),
  nickname: z.string().max(60).optional(),
  photoUrl: z.string().url().optional(),
  instagram: z.string().max(80).optional(),
  relation: z.string().max(60).optional(),
});
export type Host = z.infer<typeof HostSchema>;

export const MusicConfigSchema = z
  .object({
    url: z.string().url(),
    autoplay: z.boolean().default(false),
    loop: z.boolean().default(true),
  })
  .nullable()
  .optional();
export type MusicConfig = z.infer<typeof MusicConfigSchema>;

export const StreamConfigSchema = z
  .object({
    platform: zStreamPlatform,
    url: z.string().url(),
  })
  .nullable()
  .optional();
export type StreamConfig = z.infer<typeof StreamConfigSchema>;

export const SeoSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(320),
  ogImage: z.string().url().optional(),
});
export type Seo = z.infer<typeof SeoSchema>;

export const HeroConfigSchema = z.object({
  mediaType: zMediaType.default('image'),
  mediaUrl: z.string().url(),
  posterUrl: z.string().url().optional(),
  overlay: z.number().min(0).max(0.9).default(0.4),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().max(300).optional(),
});
export type HeroConfig = z.infer<typeof HeroConfigSchema>;

export const EventSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  type: zEventType,
  slug: slugSchema,
  name: z.string().min(1).max(120),
  status: zEventStatus,
  hosts: z.array(HostSchema).max(10).default([]),
  mainDate: z.string().datetime(),
  language: zLanguage.default('id'),
  themeId: z.string().min(1),
  music: MusicConfigSchema,
  stream: StreamConfigSchema,
  hero: HeroConfigSchema,
  seo: SeoSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Event = z.infer<typeof EventSchema>;

export const EventCreateSchema = EventSchema.omit({
  id: true,
  tenantId: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type EventCreateInput = z.infer<typeof EventCreateSchema>;

export const EventUpdateSchema = EventCreateSchema.partial();
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;