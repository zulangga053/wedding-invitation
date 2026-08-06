import { z } from 'zod';
import { zBlockType } from '../enums';

export const heroBlockDataSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(240).optional(),
  greeting: z.string().max(80).optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().max(300).optional(),
});

export const countdownBlockDataSchema = z.object({
  title: z.string().max(80).optional(),
  targetDate: z.string().datetime().optional(),
  enabledUnits: z
    .array(z.enum(['days', 'hours', 'minutes', 'seconds']))
    .default(['days', 'hours', 'minutes', 'seconds']),
});

export const timelineBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        date: z.string().min(1).max(80),
        description: z.string().max(500),
        imageUrl: z.string().url().optional(),
      })
    )
    .default([]),
});

export const eventsBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        type: z.string().max(40),
        name: z.string().min(1).max(120),
        date: z.string().min(1).max(80),
        time: z.string().max(40).optional(),
        venueName: z.string().max(120).optional(),
        venueAddress: z.string().max(240).optional(),
        mapsUrl: z.string().url().optional(),
        dressCode: z.string().max(120).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .default([]),
});

export const galleryBlockDataSchema = z.object({ title: z.string().max(120).optional() });

export const mapsBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        address: z.string().max(240).optional(),
        mapsUrl: z.string().url().optional(),
      })
    )
    .default([]),
});

export const videoBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  youtubeId: z.string().max(60),
  caption: z.string().max(240).optional(),
});

export const giftBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(240).optional(),
});

export const rsvpBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(240).optional(),
  requireContact: z.boolean().default(false),
  deadline: z.string().datetime().optional(),
});

export const wishesBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  description: z.string().max(240).optional(),
  requireApproval: z.boolean().default(false),
});

export const faqBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        question: z.string().min(1).max(200),
        answer: z.string().min(1).max(600),
      })
    )
    .default([]),
});

export const contactBlockDataSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(240).optional(),
  mapsUrl: z.string().url().optional(),
});

export const streamBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  platform: z.enum(['zoom', 'youtube', 'other']),
  url: z.string().url(),
  datetime: z.string().datetime().optional(),
});

export const shareBlockDataSchema = z.object({
  message: z.string().max(200).optional(),
});

export const sponsorsBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        logoUrl: z.string().url().optional(),
        url: z.string().url().optional(),
      })
    )
    .default([]),
});

export const vendorsBlockDataSchema = z.object({
  title: z.string().max(120).optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        category: z.string().max(60).optional(),
        url: z.string().url().optional(),
      })
    )
    .default([]),
});

/**
 * Registry of per-block data schemas. New themes/plugins register additional
 * block schemas here or via the plugin registry without touching business logic.
 */
export const BLOCK_DATA_SCHEMAS = {
  hero: heroBlockDataSchema,
  countdown: countdownBlockDataSchema,
  timeline: timelineBlockDataSchema,
  events: eventsBlockDataSchema,
  gallery: galleryBlockDataSchema,
  maps: mapsBlockDataSchema,
  video: videoBlockDataSchema,
  gift: giftBlockDataSchema,
  rsvp: rsvpBlockDataSchema,
  wishes: wishesBlockDataSchema,
  faq: faqBlockDataSchema,
  contact: contactBlockDataSchema,
  sponsors: sponsorsBlockDataSchema,
  vendors: vendorsBlockDataSchema,
  stream: streamBlockDataSchema,
  share: shareBlockDataSchema,
} as const satisfies Record<string, z.ZodType>;

export type BlockData = {
  [K in keyof typeof BLOCK_DATA_SCHEMAS]: z.infer<typeof BLOCK_DATA_SCHEMAS[K]>;
}[keyof typeof BLOCK_DATA_SCHEMAS];

export const SectionSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  blockType: zBlockType,
  data: z.unknown(),
  schemaVersion: z.number().int().min(1).default(1),
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
});
export type Section = z.infer<typeof SectionSchema>;

/**
 * Input schema for creating/updating a section. The `blockType` selects the
 * required data shape from the block registry (BLOCK_DATA_SCHEMAS), validated
 * at runtime via superRefine so consumers get a single, simple-typed input.
 */
export const SectionInputSchema = z
  .object({
    blockType: zBlockType,
    data: z.unknown(),
  })
  .superRefine((value, ctx) => {
    const schema = BLOCK_DATA_SCHEMAS[value.blockType];
    const parsed = schema.safeParse(value.data);
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['data'],
        message: `Invalid data for block "${value.blockType}"`,
        params: { issues: parsed.error.issues },
      });
    }
  });

export type SectionInput = z.infer<typeof SectionInputSchema>;