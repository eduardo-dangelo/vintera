import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { AlbumService } from '@/services/albumService';

function parseAlbumId(albumIdStr: string) {
  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(albumId)) {
    return null;
  }
  return albumId;
}

export async function POST(
  _request: Request,
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

    const album = await AlbumService.duplicateAlbum(albumId, user.id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    logger.error(`Error duplicating album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to duplicate album' }, { status: 500 });
  }
}
