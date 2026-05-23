import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { AlbumService } from '@/services/albumService';
import { UpdateAlbumValidation } from '@/validations/AlbumValidation';

function parseIds(projectIdStr: string, albumIdStr: string) {
  const projectId = Number.parseInt(projectIdStr, 10);
  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(projectId) || Number.isNaN(albumId)) {
    return null;
  }
  return { projectId, albumId };
}

export const PATCH = async (
  request: Request,
  props: { params: Promise<{ id: string; albumId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, albumId: albumIdStr } = await props.params;
    const ids = parseIds(id, albumIdStr);
    if (!ids) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateAlbumValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const album = await AlbumService.updateAlbum(ids.albumId, ids.projectId, parse.data, user.id);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ album });
  } catch (error) {
    logger.error(`Error updating album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string; albumId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, albumId: albumIdStr } = await props.params;
    const ids = parseIds(id, albumIdStr);
    if (!ids) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await AlbumService.deleteAlbum(ids.albumId, ids.projectId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
};
