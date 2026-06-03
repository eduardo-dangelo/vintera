import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { currentUser } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { MusicProjectService } from '@/services/musicProjectService';

const IMAGE_ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

const UPLOADS_DIR = 'public/uploads';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = Number.parseInt(id, 10);

    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const project = await MusicProjectService.getProjectById(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing file or type (logo | hero)' },
        { status: 400 },
      );
    }

    if (type !== 'logo' && type !== 'hero') {
      return NextResponse.json(
        { error: 'Invalid type. Must be logo or hero' },
        { status: 400 },
      );
    }

    const mimeType = file.type;
    const size = file.size;

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4.5 MB' },
        { status: 400 },
      );
    }

    if (!IMAGE_ACCEPT.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepts PNG, JPG, GIF, WebP only' },
        { status: 400 },
      );
    }

    const ext = mimeType.split('/')[1] || 'bin';
    const fileId = randomUUID();
    const pathname = `music-projects/${projectId}/${type}/${fileId}.${ext}`;

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      url = blob.url;
      logger.info('Music project image uploaded', { projectId, type, pathname });
    } else {
      const dir = path.join(process.cwd(), UPLOADS_DIR, path.dirname(pathname));
      await mkdir(dir, { recursive: true });
      const filePath = path.join(process.cwd(), UPLOADS_DIR, pathname);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      url = `/uploads/${pathname}`;
      logger.info('Music project image uploaded (local)', { projectId, type, pathname });
    }

    return NextResponse.json({
      id: fileId,
      url,
      size,
      mimeType,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error uploading music project image: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
