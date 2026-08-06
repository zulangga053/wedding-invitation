import { z } from 'zod';
import { zGuestAttendance } from '../enums';

export const GuestSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  name: z.string().min(2).max(120),
  category: z.string().max(60).optional(),
  side: z.string().max(40).optional(),
  phone: z.string().max(40).optional(),
  group: z.string().max(60).optional(),
  tags: z.array(z.string().max(40)).default([]),
  attendance: zGuestAttendance.default('pending'),
  checkIn: z
    .object({
      status: z.boolean().default(false),
      at: z.string().datetime().nullable().default(null),
      by: z.string().max(80).optional(),
    })
    .default({ status: false, at: null }),
  inviteCode: z.string().max(64).optional(),
  qrUrl: z.string().url().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Guest = z.infer<typeof GuestSchema>;

export const GuestInputSchema = GuestSchema.omit({
  id: true,
  tenantId: true,
  eventId: true,
  attendance: true,
  checkIn: true,
  inviteCode: true,
  qrUrl: true,
  createdAt: true,
  updatedAt: true,
});
export type GuestInput = z.infer<typeof GuestInputSchema>;

/** Lean guest row accepted for Excel bulk import. */
export const GuestImportRowSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().max(60).optional(),
  side: z.string().max(40).optional(),
  phone: z.string().max(40).optional(),
  group: z.string().max(60).optional(),
  tags: z.array(z.string().max(40)).default([]),
  notes: z.string().max(500).optional(),
});
export type GuestImportRow = z.infer<typeof GuestImportRowSchema>;

export const GuestCheckInSchema = z.object({
  guestId: z.string().min(1),
});
export type GuestCheckInInput = z.infer<typeof GuestCheckInSchema>;