import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';

function parseSongId(songIdStr: string) {
  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(songId)) {
    return null;
  }
  return songId;
}

export async function POST(
  _request: Request,
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

    const song = await SongService.duplicateSong(songId, user.id);
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    logger.error(`Error duplicating song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to duplicate song' }, { status: 500 });
  }
}
