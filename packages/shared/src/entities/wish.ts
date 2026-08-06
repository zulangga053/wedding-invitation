import { z } from 'zod';

export const WishSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  name: z.string().min(2).max(80),
  message: z.string().min(1).max(1000),
  avatarUrl: z.string().url().optional(),
  isApproved: z.boolean().default(true),
  createdAt: z.string().datetime(),
});
export type Wish = z.infer<typeof WishSchema>;