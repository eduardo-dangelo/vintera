import z from 'zod';
import { imageUrlSchema } from '@/validations/imageUrlSchema';

export const AlbumValidation = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  releaseDate: z.coerce.date().optional().nullable(),
  coverImageUrl: imageUrlSchema.optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateAlbumValidation = AlbumValidation.partial();

export type AlbumInput = z.infer<typeof AlbumValidation>;
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumValidation>;
