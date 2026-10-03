import type { ShareKind } from '@/utils/shareUrls';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import {
  resolveAlbumCoverImageUrl,
  resolveSongCoverImageUrl,
} from '@/utils/musicEntityHeroMetadata';

export type { ShareKind } from '@/utils/shareUrls';
export {
  buildEmbedSnippet,
  getEmbedPageHref,
  getShareItemHref,
  getSharePageHref,
  parseShareKind,
} from '@/utils/shareUrls';

export type ShareTeaser = {
  kind: ShareKind;
  id: number;
  name: string;
  coverImageUrl: string | null;
  color: string | null;
};

export class ShareService {
  static async getTeaser(kind: ShareKind, id: number): Promise<ShareTeaser | null> {
    if (kind === 'project') {
      const [project] = await db
        .select({
          id: musicProjectsSchema.id,
          name: musicProjectsSchema.name,
          coverImageUrl: musicProjectsSchema.coverImageUrl,
          color: musicProjectsSchema.color,
        })
        .from(musicProjectsSchema)
        .where(eq(musicProjectsSchema.id, id))
        .limit(1);

      if (!project) {
        return null;
      }

      return {
        kind: 'project',
        id: project.id,
        name: project.name,
        coverImageUrl: project.coverImageUrl,
        color: project.color,
      };
    }

    if (kind === 'album') {
      const [row] = await db
        .select({
          id: albumsSchema.id,
          name: albumsSchema.name,
          coverImageUrl: albumsSchema.coverImageUrl,
          projectColor: musicProjectsSchema.color,
          projectCoverImageUrl: musicProjectsSchema.coverImageUrl,
        })
        .from(albumsSchema)
        .innerJoin(
          musicProjectsSchema,
          eq(albumsSchema.musicProjectId, musicProjectsSchema.id),
        )
        .where(eq(albumsSchema.id, id))
        .limit(1);

      if (!row) {
        return null;
      }

      return {
        kind: 'album',
        id: row.id,
        name: row.name,
        coverImageUrl: resolveAlbumCoverImageUrl({
          albumCoverImageUrl: row.coverImageUrl,
          projectCoverImageUrl: row.projectCoverImageUrl,
        }),
        color: row.projectColor,
      };
    }

    const [row] = await db
      .select({
        id: songsSchema.id,
        title: songsSchema.title,
        metadata: songsSchema.metadata,
        albumCoverImageUrl: albumsSchema.coverImageUrl,
        projectColor: musicProjectsSchema.color,
        projectCoverImageUrl: musicProjectsSchema.coverImageUrl,
      })
      .from(songsSchema)
      .leftJoin(albumsSchema, eq(songsSchema.albumId, albumsSchema.id))
      .leftJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(songsSchema.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      kind: 'song',
      id: row.id,
      name: row.title,
      coverImageUrl: resolveSongCoverImageUrl({
        songMetadata: row.metadata,
        albumCoverImageUrl: row.albumCoverImageUrl,
        projectCoverImageUrl: row.projectCoverImageUrl,
      }),
      color: row.projectColor,
    };
  }
}
