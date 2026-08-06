import { z } from 'zod';
import { slugSchema, zTenantPlan, zTenantStatus } from '../enums';

export const TenantSettingsSchema = z.object({
  branding: z
    .object({
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    })
    .default({}),
  features: z.array(z.string()).default([]),
});

export const TenantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  slug: slugSchema,
  ownerUid: z.string().min(1),
  plan: zTenantPlan,
  status: zTenantStatus,
  trialEndsAt: z.string().datetime().nullable(),
  settings: TenantSettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const TenantCreateSchema = z.object({
  name: z.string().min(1).max(80),
  slug: slugSchema,
});
export type TenantCreateInput = z.infer<typeof TenantCreateSchema>;

export const TenantUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  settings: TenantSettingsSchema.partial().optional(),
});
export type TenantUpdateInput = z.infer<typeof TenantUpdateSchema>;