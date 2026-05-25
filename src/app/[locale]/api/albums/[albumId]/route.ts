import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { AlbumService } from '@/services/albumService';
import { UpdateAlbumValidation } from '@/validations/AlbumValidation';

function parseAlbumId(albumIdStr: string) {
  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(albumId)) {
    return null;
  }
  return albumId;
}

export async function GET(
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

    const result = await AlbumService.getAlbumByIdForUser(albumId, user.id);
    if (!result) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error(`Error fetching album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
  }
}

export async function PATCH(
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

    const json = await request.json();
    const parse = UpdateAlbumValidation.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const album = await AlbumService.updateAlbum(
      albumId,
      existing.album.musicProjectId,
      parse.data,
      user.id,
    );
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ album, project: existing.project });
  } catch (error) {
    logger.error(`Error updating album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

export async function DELETE(
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

    const existing = await AlbumService.getAlbumByIdForUser(albumId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const deleted = await AlbumService.deleteAlbum(
      albumId,
      existing.album.musicProjectId,
      user.id,
    );
    if (!deleted) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting album: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
