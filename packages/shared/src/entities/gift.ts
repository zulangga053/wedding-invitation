import { z } from 'zod';

export const GIFT_TYPES = ['bank', 'qris'] as const;
export type GiftType = (typeof GIFT_TYPES)[number];

export const GiftSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  type: z.enum(GIFT_TYPES),
  label: z.string().min(1).max(80),
  bankName: z.string().max(60).optional(),
  accountNumber: z.string().max(40).optional(),
  accountHolder: z.string().max(80).optional(),
  qrisImageUrl: z.string().url().optional(),
  description: z.string().max(240).optional(),
  order: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Gift = z.infer<typeof GiftSchema>;

export const GiftInputSchema = GiftSchema.omit({
  id: true,
  tenantId: true,
  eventId: true,
  createdAt: true,
  updatedAt: true,
});
export type GiftInput = z.infer<typeof GiftInputSchema>;

/** Confirmation recorded when a guest confirms a gift. */
export const GiftConfirmationSchema = z.object({
  id: z.string().min(1),
  giftId: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  name: z.string().min(2).max(80),
  amount: z.number().positive().optional(),
  note: z.string().max(300).optional(),
  createdAt: z.string().datetime(),
});
export type GiftConfirmation = z.infer<typeof GiftConfirmationSchema>;