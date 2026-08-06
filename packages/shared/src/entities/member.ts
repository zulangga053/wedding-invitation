import { z } from 'zod';
import { zMemberRole } from '../enums';

export const MemberSchema = z.object({
  uid: z.string().min(1),
  tenantId: z.string().min(1),
  role: zMemberRole,
  email: z.string().email().optional(),
  displayName: z.string().max(80).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Member = z.infer<typeof MemberSchema>;

export const MemberCreateSchema = z.object({
  uid: z.string().min(1),
  role: zMemberRole,
});
export type MemberCreateInput = z.infer<typeof MemberCreateSchema>;