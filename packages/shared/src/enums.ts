import { z } from 'zod';

export const EVENT_TYPES = [
  'wedding',
  'engagement',
  'birthday',
  'graduation',
  'aqiqah',
  'corporate',
  'seminar',
  'gathering',
  'religious',
  'custom',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const TENANT_PLANS = ['free', 'pro', 'premium', 'enterprise'] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const TENANT_STATUSES = ['trial', 'active', 'suspended'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const MEMBER_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const BLOCK_TYPES = [
  'hero',
  'countdown',
  'timeline',
  'gallery',
  'maps',
  'video',
  'gift',
  'rsvp',
  'wishes',
  'faq',
  'contact',
  'sponsors',
  'vendors',
  'stream',
  'share',
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const LANGUAGES = ['id', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export const MEDIA_TYPES = ['image', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const RSVP_ATTENDANCE = ['yes', 'no', 'maybe'] as const;
export type RsvpAttendance = (typeof RSVP_ATTENDANCE)[number];

export const GUEST_ATTENDANCE = ['pending', 'yes', 'no', 'maybe'] as const;
export type GuestAttendance = (typeof GUEST_ATTENDANCE)[number];

export const STREAM_PLATFORMS = ['zoom', 'youtube', 'other'] as const;
export type StreamPlatform = (typeof STREAM_PLATFORMS)[number];

export const zEventType = z.enum(EVENT_TYPES);
export const zEventStatus = z.enum(EVENT_STATUSES);
export const zTenantPlan = z.enum(TENANT_PLANS);
export const zTenantStatus = z.enum(TENANT_STATUSES);
export const zMemberRole = z.enum(MEMBER_ROLES);
export const zBlockType = z.enum(BLOCK_TYPES);
export const zLanguage = z.enum(LANGUAGES);
export const zMediaType = z.enum(MEDIA_TYPES);
export const zRsvpAttendance = z.enum(RSVP_ATTENDANCE);
export const zGuestAttendance = z.enum(GUEST_ATTENDANCE);
export const zStreamPlatform = z.enum(STREAM_PLATFORMS);

/** Shared slug constraint for tenants, events, and invitations. */
export const slugSchema = z
  .string()
  .min(1)
  .max(63)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'slug must be lowercase, alphanumeric, hyphens only of length 1-63');

export type Slug = z.infer<typeof slugSchema>;