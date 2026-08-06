import { z } from 'zod';

export const GalleryPhotoSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  eventId: z.string().min(1),
  imageUrl: z.string().url(),
  caption: z.string().max(200).optional(),
  order: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
});
export type GalleryPhoto = z.infer<typeof GalleryPhotoSchema>;

export const GalleryPhotoInputSchema = GalleryPhotoSchema.omit({
  id: true,
  tenantId: true,
  eventId: true,
  createdAt: true,
});
export type GalleryPhotoInput = z.infer<typeof GalleryPhotoInputSchema>;