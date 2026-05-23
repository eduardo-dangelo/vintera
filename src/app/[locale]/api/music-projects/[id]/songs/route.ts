import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';
import { SongValidation } from '@/validations/SongValidation';

function parseProjectId(id: string) {
  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return null;
  }
  return projectId;
}

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const songs = await SongService.getSongsByProjectId(projectId, user.id);
    if (songs === null) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ songs });
  } catch (error) {
    logger.error(`Error fetching songs: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
};

export const POST = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = SongValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const song = await SongService.createSong(projectId, parse.data, user.id);
    if (!song) {
      return NextResponse.json({ error: 'Project not found or invalid album' }, { status: 404 });
    }

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
};
