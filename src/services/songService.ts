import type { SongInput, UpdateSongInput } from '@/validations/SongValidation';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import { MusicProjectService } from '@/services/musicProjectService';

export class SongService {
  static async getSongsByUserId(userId: string) {
    return db
      .select({
        id: songsSchema.id,
        title: songsSchema.title,
        musicProjectId: songsSchema.musicProjectId,
        albumId: songsSchema.albumId,
        status: songsSchema.status,
        updatedAt: songsSchema.updatedAt,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
      })
      .from(songsSchema)
      .innerJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(musicProjectsSchema.userId, userId))
      .orderBy(desc(songsSchema.updatedAt));
  }

  static async getSongByIdForUser(songId: number, userId: string) {
    const [row] = await db
      .select({
        song: songsSchema,
        projectId: musicProjectsSchema.id,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
        projectSlug: musicProjectsSchema.slug,
      })
      .from(songsSchema)
      .innerJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .where(
        and(
          eq(songsSchema.id, songId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      song: row.song,
      project: {
        id: row.projectId,
        name: row.projectName,
        color: row.projectColor,
        slug: row.projectSlug,
      },
    };
  }

  static async getRecentSongsByUserId(userId: string, limit = 5) {
    return db
      .select({
        id: songsSchema.id,
        title: songsSchema.title,
        musicProjectId: songsSchema.musicProjectId,
        updatedAt: songsSchema.updatedAt,
        projectName: musicProjectsSchema.name,
      })
      .from(songsSchema)
      .innerJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(musicProjectsSchema.userId, userId))
      .orderBy(desc(songsSchema.updatedAt))
      .limit(limit);
  }

  static async verifyProjectAccess(projectId: number, userId: string) {
    const project = await MusicProjectService.getProjectById(projectId, userId);
    return project !== null;
  }

  static async getSongsByProjectId(projectId: number, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    return db
      .select()
      .from(songsSchema)
      .where(eq(songsSchema.musicProjectId, projectId))
      .orderBy(songsSchema.trackNumber, songsSchema.title);
  }

  static async getSongById(songId: number, projectId: number, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    const [song] = await db
      .select()
      .from(songsSchema)
      .where(
        and(
          eq(songsSchema.id, songId),
          eq(songsSchema.musicProjectId, projectId),
        ),
      )
      .limit(1);

    return song ?? null;
  }

  static async createSong(projectId: number, data: SongInput, userId: string) {
    const hasAccess = await this.verifyProjectAccess(projectId, userId);
    if (!hasAccess) {
      return null;
    }

    if (data.albumId) {
      const [album] = await db
        .select()
        .from(albumsSchema)
        .where(
          and(
            eq(albumsSchema.id, data.albumId),
            eq(albumsSchema.musicProjectId, projectId),
          ),
        )
        .limit(1);
      if (!album) {
        return null;
      }
    }

    const [song] = await db
      .insert(songsSchema)
      .values({
        musicProjectId: projectId,
        albumId: data.albumId ?? null,
        title: data.title,
        trackNumber: data.trackNumber ?? null,
        durationSeconds: data.durationSeconds ?? null,
        key: data.key,
        bpm: data.bpm ?? null,
        lyrics: data.lyrics,
        chordsOrTabs: data.chordsOrTabs,
        metadata: data.metadata,
        status: data.status ?? 'idea',
      })
      .returning();

    return song;
  }

  static async updateSong(
    songId: number,
    projectId: number,
    data: UpdateSongInput,
    userId: string,
  ) {
    const existing = await this.getSongById(songId, projectId, userId);
    if (!existing) {
      return null;
    }

    if (data.albumId) {
      const [album] = await db
        .select()
        .from(albumsSchema)
        .where(
          and(
            eq(albumsSchema.id, data.albumId),
            eq(albumsSchema.musicProjectId, projectId),
          ),
        )
        .limit(1);
      if (!album) {
        return null;
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.albumId !== undefined) {
      updateData.albumId = data.albumId;
    }
    if (data.trackNumber !== undefined) {
      updateData.trackNumber = data.trackNumber;
    }
    if (data.durationSeconds !== undefined) {
      updateData.durationSeconds = data.durationSeconds;
    }
    if (data.key !== undefined) {
      updateData.key = data.key;
    }
    if (data.bpm !== undefined) {
      updateData.bpm = data.bpm;
    }
    if (data.lyrics !== undefined) {
      updateData.lyrics = data.lyrics;
    }
    if (data.chordsOrTabs !== undefined) {
      updateData.chordsOrTabs = data.chordsOrTabs;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const [updated] = await db
      .update(songsSchema)
      .set(updateData)
      .where(eq(songsSchema.id, songId))
      .returning();

    return updated ?? null;
  }

  static async deleteSong(songId: number, projectId: number, userId: string) {
    const existing = await this.getSongById(songId, projectId, userId);
    if (!existing) {
      return false;
    }

    await db.delete(songsSchema).where(eq(songsSchema.id, songId));
    return true;
  }
}
