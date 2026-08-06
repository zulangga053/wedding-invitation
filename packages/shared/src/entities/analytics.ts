import { z } from 'zod';

export const ANALYTICS_METRICS = [
  'views',
  'rsvp',
  'wishes',
  'giftConfirmations',
  'shares',
] as const;
export type AnalyticsMetric = (typeof ANALYTICS_METRICS)[number];

export const DailyStatSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  views: z.number().int().min(0).default(0),
  rsvp: z.number().int().min(0).default(0),
  wishes: z.number().int().min(0).default(0),
  giftConfirmations: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
});
export type DailyStat = z.infer<typeof DailyStatSchema>;

export const AnalyticsSummarySchema = z.object({
  views: z.number().int().min(0),
  rsvp: z.number().int().min(0),
  wishes: z.number().int().min(0),
  giftConfirmations: z.number().int().min(0),
  shares: z.number().int().min(0),
});
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;

export const ANALYTICS_EVENT_TYPES = ['view', 'rsvp', 'wish', 'giftConfirm', 'share'] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];