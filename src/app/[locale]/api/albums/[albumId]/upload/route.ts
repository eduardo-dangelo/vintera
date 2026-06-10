import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { AlbumService } from '@/services/albumService';
import { uploadMusicImageFile, validateMusicImageUpload } from '@/utils/musicImageUpload';

function parseAlbumId(albumIdStr: string) {
  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(albumId)) {
    return null;
  }
  return albumId;
}

export async function POST(
  request: Request,
  props: { params: Promise<{ albumId: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { albumId: albumIdStr } = await props.params;
    const albumId = parseAlbumId(albumIdStr);
    if (!albumId) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const existing = await AlbumService.getAlbumByIdForUser(albumId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
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
      `albums/${albumId}`,
      { albumId },
    );

    return NextResponse.json(upload);
  } catch (error) {
    logger.error(`Error uploading album image: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
