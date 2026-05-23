import z from 'zod';

export const AlbumValidation = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  releaseDate: z.coerce.date().optional().nullable(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
  status: z.enum(['draft', 'released']).optional(),
});

export const UpdateAlbumValidation = AlbumValidation.partial();

export type AlbumInput = z.infer<typeof AlbumValidation>;
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumValidation>;
