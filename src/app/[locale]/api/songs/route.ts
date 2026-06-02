import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { SongService } from '@/services/songService';
import { SongValidation } from '@/validations/SongValidation';

const CreateSongBodyValidation = SongValidation.and(
  z.object({
    projectId: z.number().int().positive().optional().nullable(),
  }),
);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const songs = await SongService.getSongsByUserId(user.id);
    return NextResponse.json({ songs });
  } catch (error) {
    logger.error(`Error fetching songs: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const parse = CreateSongBodyValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const { projectId, ...songData } = parse.data;
    const song = await SongService.createSongForUser(user.id, {
      ...songData,
      musicProjectId: projectId ?? null,
    });

    if (!song) {
      return NextResponse.json({ error: 'Project not found or invalid album' }, { status: 404 });
    }

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating song: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
}
