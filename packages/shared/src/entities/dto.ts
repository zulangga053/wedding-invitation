import { z } from 'zod';
import { slugSchema, zRsvpAttendance } from '../enums';

/** Public RSVP submission — validated at the API boundary, rate-limited. */
export const RsvpCreateSchema = z.object({
  eventSlug: slugSchema,
  guestName: z.string().min(2).max(80),
  attendance: zRsvpAttendance,
  guestCount: z.number().int().min(1).max(20).default(1),
  message: z.string().max(1000).optional(),
  contact: z.string().max(120).optional(),
  inviteCode: z.string().max(64).optional(),
  /** Anti-spam honeypot — must stay empty. */
  honeypot: z.string().max(0).optional(),
});
export type RsvpCreateInput = z.infer<typeof RsvpCreateSchema>;

/** Public wish/well-wishes submission. */
export const WishCreateSchema = z.object({
  eventSlug: slugSchema,
  name: z.string().min(2).max(80),
  message: z.string().min(1).max(1000),
  avatarUrl: z.string().url().optional(),
  honeypot: z.string().max(0).optional(),
});
export type WishCreateInput = z.infer<typeof WishCreateSchema>;

/** Gift confirmation submitted by a guest. */
export const GiftConfirmSchema = z.object({
  eventSlug: slugSchema,
  giftId: z.string().min(1),
  name: z.string().min(2).max(80),
  amount: z.number().positive().optional(),
  note: z.string().max(300).optional(),
  honeypot: z.string().max(0).optional(),
});
export type GiftConfirmInput = z.infer<typeof GiftConfirmSchema>;

/** Anonymous view-tracking event. */
export const ViewTrackSchema = z.object({
  eventSlug: slugSchema,
  referrer: z.string().max(300).optional(),
  device: z.string().max(40).optional(),
  browser: z.string().max(40).optional(),
});
export type ViewTrackInput = z.infer<typeof ViewTrackSchema>;