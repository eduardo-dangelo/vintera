import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';
import { logger } from '@/libs/Logger';

const IMAGE_ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;
const UPLOADS_DIR = 'public/uploads';

export type MusicImageUploadType = 'logo' | 'hero';

export function validateMusicImageUpload(file: File, type: string): { error?: string } {
  if (!file || !type) {
    return { error: 'Missing file or type (logo | hero)' };
  }

  if (type !== 'logo' && type !== 'hero') {
    return { error: 'Invalid type. Must be logo or hero' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 4.5 MB' };
  }

  if (!IMAGE_ACCEPT.includes(file.type)) {
    return { error: 'Invalid file type. Accepts PNG, JPG, GIF, WebP only' };
  }

  return {};
}

export async function uploadMusicImageFile(
  file: File,
  type: MusicImageUploadType,
  pathnamePrefix: string,
  logContext: Record<string, unknown>,
): Promise<{ id: string; url: string; size: number; mimeType: string; createdAt: string }> {
  const mimeType = file.type;
  const size = file.size;
  const ext = mimeType.split('/')[1] || 'bin';
  const fileId = randomUUID();
  const pathname = `${pathnamePrefix}/${type}/${fileId}.${ext}`;

  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    url = blob.url;
    logger.info('Music image uploaded', { ...logContext, type, pathname });
  } else {
    const dir = path.join(process.cwd(), UPLOADS_DIR, path.dirname(pathname));
    await mkdir(dir, { recursive: true });
    const filePath = path.join(process.cwd(), UPLOADS_DIR, pathname);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    url = `/uploads/${pathname}`;
    logger.info('Music image uploaded (local)', { ...logContext, type, pathname });
  }

  return {
    id: fileId,
    url,
    size,
    mimeType,
    createdAt: new Date().toISOString(),
  };
}
