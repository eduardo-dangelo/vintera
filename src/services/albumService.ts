import type { AlbumInput, UpdateAlbumInput } from '@/validations/AlbumValidation';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema } from '@/models/Schema';
import { MusicProjectService } from '@/services/musicProjectService';

export class AlbumService {
  static async getAlbumsByUserId(userId: string) {
    return db
      .select({
        id: albumsSchema.id,
        name: albumsSchema.name,
        musicProjectId: albumsSchema.musicProjectId,
        status: albumsSchema.status,
        updatedAt: albumsSchema.updatedAt,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
      })
      .from(albumsSchema)
      .innerJoin(musicProjectsSchema, eq(albumsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(musicProjectsSchema.userId, userId))
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
      })
      .from(albumsSchema)
      .innerJoin(musicProjectsSchema, eq(albumsSchema.musicProjectId, musicProjectsSchema.id))
      .where(
        and(
          eq(albumsSchema.id, albumId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      album: row.album,
      project: {
        id: row.projectId,
        name: row.projectName,
        color: row.projectColor,
        slug: row.projectSlug,
      },
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

    return db
      .select()
      .from(albumsSchema)
      .where(eq(albumsSchema.musicProjectId, projectId))
      .orderBy(albumsSchema.sortOrder, albumsSchema.name);
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

    return album ?? null;
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
        name: data.name,
        description: data.description,
        releaseDate: data.releaseDate ?? null,
        coverImageUrl: data.coverImageUrl || null,
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? 'draft',
      })
      .returning();

    return album;
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
      updateData.name = data.name;
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
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const [updated] = await db
      .update(albumsSchema)
      .set(updateData)
      .where(eq(albumsSchema.id, albumId))
      .returning();

    return updated ?? null;
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
