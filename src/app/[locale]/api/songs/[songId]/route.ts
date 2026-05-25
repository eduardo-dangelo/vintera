import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';
import { UpdateSongValidation } from '@/validations/SongValidation';

function parseSongId(songIdStr: string) {
  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(songId)) {
    return null;
  }
  return songId;
}

export async function GET(
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

    const result = await SongService.getSongByIdForUser(songId, user.id);
    if (!result) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Error fetching song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
}

export async function PATCH(
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

    const json = await request.json();
    const parse = UpdateSongValidation.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const song = await SongService.updateSong(
      songId,
      existing.song.musicProjectId,
      parse.data,
      user.id,
    );
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ song, project: existing.project });
  } catch (error) {
    logger.error(`Error updating song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await SongService.getSongByIdForUser(songId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const deleted = await SongService.deleteSong(
      songId,
      existing.song.musicProjectId,
      user.id,
    );
    if (!deleted) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
}
