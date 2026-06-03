import z from 'zod';

/** Absolute URLs (Vercel Blob) or root-relative paths (local `public/uploads`). */
export const imageUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/.+/, { error: 'Invalid URL' }),
  z.literal(''),
]);
