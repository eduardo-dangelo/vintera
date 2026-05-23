import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';
import { UpdateSongValidation } from '@/validations/SongValidation';

function parseIds(projectIdStr: string, songIdStr: string) {
  const projectId = Number.parseInt(projectIdStr, 10);
  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(projectId) || Number.isNaN(songId)) {
    return null;
  }
  return { projectId, songId };
}

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string; songId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, songId: songIdStr } = await props.params;
    const ids = parseIds(id, songIdStr);
    if (!ids) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const song = await SongService.getSongById(ids.songId, ids.projectId, user.id);
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    logger.error(`Error fetching song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
  }
};

export const PATCH = async (
  request: Request,
  props: { params: Promise<{ id: string; songId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, songId: songIdStr } = await props.params;
    const ids = parseIds(id, songIdStr);
    if (!ids) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateSongValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const song = await SongService.updateSong(ids.songId, ids.projectId, parse.data, user.id);
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    logger.error(`Error updating song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 });
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string; songId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, songId: songIdStr } = await props.params;
    const ids = parseIds(id, songIdStr);
    if (!ids) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await SongService.deleteSong(ids.songId, ids.projectId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
  }
};
