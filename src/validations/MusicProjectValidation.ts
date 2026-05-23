import z from 'zod';

export const MusicProjectValidation = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  genre: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateMusicProjectValidation = MusicProjectValidation.partial();

export type MusicProjectInput = z.infer<typeof MusicProjectValidation>;
export type UpdateMusicProjectInput = z.infer<typeof UpdateMusicProjectValidation>;
