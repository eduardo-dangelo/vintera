import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';
import { uploadMusicImageFile, validateMusicImageUpload } from '@/utils/musicImageUpload';

function parseSongId(songIdStr: string) {
  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(songId)) {
    return null;
  }
  return songId;
}

export async function POST(
  request: Request,
  props: { params: Promise<{ songId: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId: songIdStr } = await props.params;
    const songId = parseSongId(songIdStr);
    if (!songId) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await SongService.getSongByIdForUser(songId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
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

    const validation = validateMusicImageUpload(file, type);

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const upload = await uploadMusicImageFile(
      file,
      type as 'logo' | 'hero',
      `songs/${songId}`,
      { songId },
    );

    return NextResponse.json(upload);
  } catch (error) {
    logger.error(`Error uploading song image: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
