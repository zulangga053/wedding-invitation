import { z } from 'zod';
import { zRsvpAttendance } from '../enums';

export const RsvpSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  guestName: z.string().min(2).max(80),
  attendance: zRsvpAttendance,
  guestCount: z.number().int().min(1).max(20).default(1),
  message: z.string().max(1000).optional(),
  contact: z.string().max(120).optional(),
  inviteCode: z.string().max(64).optional(),
  createdAt: z.string().datetime(),
});
export type Rsvp = z.infer<typeof RsvpSchema>;