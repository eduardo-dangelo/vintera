import type { AlbumInput, UpdateAlbumInput } from '@/validations/AlbumValidation';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import { MusicProjectService } from '@/services/musicProjectService';
import { omitStatus, omitStatusFromArray } from '@/utils/omitMusicStatus';
import { toTitleCase } from '@/utils/toTitleCase';

export class AlbumService {
  static async getAlbumsByUserId(userId: string) {
    return db
      .select({
        id: albumsSchema.id,
        name: albumsSchema.name,
        musicProjectId: albumsSchema.musicProjectId,
        updatedAt: albumsSchema.updatedAt,
        coverImageUrl: albumsSchema.coverImageUrl,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
        songCount: sql<number>`cast(count(${songsSchema.id}) as int)`,
      })
      .from(albumsSchema)
      .innerJoin(musicProjectsSchema, eq(albumsSchema.musicProjectId, musicProjectsSchema.id))
      .leftJoin(songsSchema, eq(songsSchema.albumId, albumsSchema.id))
      .where(eq(musicProjectsSchema.userId, userId))
      .groupBy(
        albumsSchema.id,
        albumsSchema.name,
        albumsSchema.musicProjectId,
        albumsSchema.updatedAt,
        albumsSchema.coverImageUrl,
        musicProjectsSchema.name,
        musicProjectsSchema.color,
      )
      .orderBy(desc(albumsSchema.updatedAt));
  }

  static async getAlbumByIdForUser(albumId: number, userId: string) {
    const [row] = await db
      .select({
        album: albumsSchema,
        projectId: musicProjectsSchema.id,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
        projectSlug: musicProjectsSchema.slug,
        projectMetadata: musicProjectsSchema.metadata,
        projectCoverImageUrl: musicProjectsSchema.coverImageUrl,
        songCount: sql<number>`cast(count(${songsSchema.id}) as int)`,
      })
      .from(albumsSchema)
      .innerJoin(musicProjectsSchema, eq(albumsSchema.musicProjectId, musicProjectsSchema.id))
      .leftJoin(songsSchema, eq(songsSchema.albumId, albumsSchema.id))
      .where(
        and(
          eq(albumsSchema.id, albumId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .groupBy(
        albumsSchema.id,
        musicProjectsSchema.id,
        musicProjectsSchema.name,
        musicProjectsSchema.color,
        musicProjectsSchema.slug,
        musicProjectsSchema.metadata,
        musicProjectsSchema.coverImageUrl,
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      album: omitStatus(row.album),
      project: {
        id: row.projectId,
        name: row.projectName,
        color: row.projectColor,
        slug: row.projectSlug,
        metadata: row.projectMetadata,
        coverImageUrl: row.projectCoverImageUrl,
      },
      songCount: row.songCount,
    };
  }

  static async getRecentAlbumsByUserId(userId: string, limit = 5) {
    return db
      .select({
        id: albumsSchema.id,
        name: albumsSchema.name,
        musicProjectId: albumsSchema.musicProjectId,
        updatedAt: albumsSchema.updatedAt,
        projectName: musicProjectsSchema.name,
      })
      .from(albumsSchema)
      .innerJoin(musicProjectsSchema, eq(albumsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(musicProjectsSchema.userId, userId))
      .orderBy(desc(albumsSchema.updatedAt))
      .limit(limit);
  }

  static async verifyProjectAccess(projectId: number, userId: string) {
    const project = await MusicProjectService.getProjectById(projectId, userId);
    return project !== null;
  }

  static async getAlbumsByProjectId(projectId: number, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const albums = await db
      .select()
      .from(albumsSchema)
      .where(eq(albumsSchema.musicProjectId, projectId))
      .orderBy(albumsSchema.sortOrder, albumsSchema.name);

    return omitStatusFromArray(albums);
  }

  static async getAlbumById(albumId: number, projectId: number, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const [album] = await db
      .select()
      .from(albumsSchema)
      .where(
        and(
          eq(albumsSchema.id, albumId),
          eq(albumsSchema.musicProjectId, projectId),
        ),
      )
      .limit(1);

    return album ? omitStatus(album) : null;
  }

  static async createAlbum(projectId: number, data: AlbumInput, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const [album] = await db
      .insert(albumsSchema)
      .values({
        musicProjectId: projectId,
        name: toTitleCase(data.name),
        description: data.description,
        releaseDate: data.releaseDate ?? null,
        coverImageUrl: data.coverImageUrl || null,
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();

    return album ? omitStatus(album) : album;
  }

  static async updateAlbum(
    albumId: number,
    projectId: number,
    data: UpdateAlbumInput,
    userId: string,
  ) {
    const existing = await this.getAlbumById(albumId, projectId, userId);
    if (!existing) {
      return null;
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = toTitleCase(data.name);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.releaseDate !== undefined) {
      updateData.releaseDate = data.releaseDate;
    }
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl || null;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const [updated] = await db
      .update(albumsSchema)
      .set(updateData)
      .where(eq(albumsSchema.id, albumId))
      .returning();

    return updated ? omitStatus(updated) : null;
  }

  static async deleteAlbum(albumId: number, projectId: number, userId: string) {
    const existing = await this.getAlbumById(albumId, projectId, userId);
    if (!existing) {
      return false;
    }

    await db.delete(albumsSchema).where(eq(albumsSchema.id, albumId));
    return true;
  }
}
