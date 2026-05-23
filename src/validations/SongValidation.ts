import z from 'zod';

export const SongValidation = z.object({
  title: z.string().min(1).max(200),
  albumId: z.number().int().positive().optional().nullable(),
  trackNumber: z.number().int().positive().optional().nullable(),
  durationSeconds: z.number().int().positive().optional().nullable(),
  key: z.string().max(20).optional(),
  bpm: z.number().int().positive().max(400).optional().nullable(),
  lyrics: z.string().max(50000).optional(),
  chordsOrTabs: z.string().max(50000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.enum(['idea', 'demo', 'recording', 'released']).optional(),
});

export const UpdateSongValidation = SongValidation.partial();

export type SongInput = z.infer<typeof SongValidation>;
export type UpdateSongInput = z.infer<typeof UpdateSongValidation>;
