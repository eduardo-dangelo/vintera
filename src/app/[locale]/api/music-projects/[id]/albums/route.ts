import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { AlbumService } from '@/services/albumService';
import { AlbumValidation } from '@/validations/AlbumValidation';

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

    const albums = await AlbumService.getAlbumsByProjectId(projectId, user.id);
    if (albums === null) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ albums });
  } catch (error) {
    logger.error(`Error fetching albums: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
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
    const parse = AlbumValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const album = await AlbumService.createAlbum(projectId, parse.data, user.id);
    if (!album) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ album }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
};
