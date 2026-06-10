import type { SongInput, UpdateSongInput } from '@/validations/SongValidation';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import { getAuthorsBySongIds } from '@/services/musicPeopleService';
import { MusicProjectService } from '@/services/musicProjectService';
import { omitStatus, omitStatusFromArray } from '@/utils/omitMusicStatus';
import { toTitleCase } from '@/utils/toTitleCase';

export type CreateSongForUserInput = SongInput & {
  musicProjectId?: number | null;
};

export class SongService {
  static async getSongsByUserId(userId: string) {
    const songs = await db
      .select({
        id: songsSchema.id,
        title: songsSchema.title,
        musicProjectId: songsSchema.musicProjectId,
        albumId: songsSchema.albumId,
        updatedAt: songsSchema.updatedAt,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
        albumName: albumsSchema.name,
        coverImageUrl: sql<string | null>`coalesce(${albumsSchema.coverImageUrl}, ${musicProjectsSchema.coverImageUrl})`,
      })
      .from(songsSchema)
      .leftJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .leftJoin(albumsSchema, eq(songsSchema.albumId, albumsSchema.id))
      .where(eq(songsSchema.userId, userId))
      .orderBy(desc(songsSchema.updatedAt));

    const songIds = songs.map(s => s.id);
    const authorsBySong = await getAuthorsBySongIds(songIds);

    return songs.map(song => ({
      ...song,
      authors: authorsBySong.get(song.id) ?? [],
    }));
  }

  static async getSongByIdForUser(songId: number, userId: string) {
    const [row] = await db
      .select({
        song: songsSchema,
        projectId: musicProjectsSchema.id,
        projectName: musicProjectsSchema.name,
        projectColor: musicProjectsSchema.color,
        projectSlug: musicProjectsSchema.slug,
        projectMetadata: musicProjectsSchema.metadata,
        projectCoverImageUrl: musicProjectsSchema.coverImageUrl,
        albumId: albumsSchema.id,
        albumName: albumsSchema.name,
        albumCoverImageUrl: albumsSchema.coverImageUrl,
      })
      .from(songsSchema)
      .leftJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .leftJoin(albumsSchema, eq(songsSchema.albumId, albumsSchema.id))
      .where(
        and(
          eq(songsSchema.id, songId),
          eq(songsSchema.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      song: omitStatus(row.song),
      project: row.projectId != null
        ? {
            id: row.projectId,
            name: row.projectName!,
            color: row.projectColor,
            slug: row.projectSlug!,
            metadata: row.projectMetadata,
            coverImageUrl: row.projectCoverImageUrl,
          }
        : null,
      album: row.albumId != null
        ? {
            id: row.albumId,
            name: row.albumName!,
            coverImageUrl: row.albumCoverImageUrl,
          }
        : null,
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
      .leftJoin(musicProjectsSchema, eq(songsSchema.musicProjectId, musicProjectsSchema.id))
      .where(eq(songsSchema.userId, userId))
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

    const songs = await db
      .select()
      .from(songsSchema)
      .where(eq(songsSchema.musicProjectId, projectId))
      .orderBy(songsSchema.trackNumber, songsSchema.title);

    return omitStatusFromArray(songs);
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

    return song ? omitStatus(song) : null;
  }

  static async createSongForUser(userId: string, data: CreateSongForUserInput) {
    const projectId = data.musicProjectId ?? null;

    if (projectId != null) {
      return this.createSong(projectId, data, userId);
    }

    const [song] = await db
      .insert(songsSchema)
      .values({
        userId,
        musicProjectId: null,
        albumId: null,
        title: toTitleCase(data.title),
        trackNumber: data.trackNumber ?? null,
        durationSeconds: data.durationSeconds ?? null,
        key: data.key,
        bpm: data.bpm ?? null,
        lyrics: data.lyrics,
        chordsOrTabs: data.chordsOrTabs,
        metadata: data.metadata,
      })
      .returning();

    return song ? omitStatus(song) : song;
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
        userId,
        musicProjectId: projectId,
        albumId: data.albumId ?? null,
        title: toTitleCase(data.title),
        trackNumber: data.trackNumber ?? null,
        durationSeconds: data.durationSeconds ?? null,
        key: data.key,
        bpm: data.bpm ?? null,
        lyrics: data.lyrics,
        chordsOrTabs: data.chordsOrTabs,
        metadata: data.metadata,
      })
      .returning();

    return song ? omitStatus(song) : song;
  }

  static async updateSong(
    songId: number,
    projectId: number | null,
    data: UpdateSongInput,
    userId: string,
  ) {
    const existing = projectId != null
      ? await this.getSongById(songId, projectId, userId)
      : (await this.getSongByIdForUser(songId, userId))?.song;

    if (!existing) {
      return null;
    }

    const effectiveProjectId = existing.musicProjectId;

    if (data.albumId && effectiveProjectId != null) {
      const [album] = await db
        .select()
        .from(albumsSchema)
        .where(
          and(
            eq(albumsSchema.id, data.albumId),
            eq(albumsSchema.musicProjectId, effectiveProjectId),
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
      updateData.title = toTitleCase(data.title);
    }
    if (data.albumId !== undefined) {
      updateData.albumId = effectiveProjectId != null ? data.albumId : null;
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

    const [updated] = await db
      .update(songsSchema)
      .set(updateData)
      .where(
        and(
          eq(songsSchema.id, songId),
          eq(songsSchema.userId, userId),
        ),
      )
      .returning();

    return updated ? omitStatus(updated) : null;
  }

  static async deleteSong(songId: number, projectId: number | null, userId: string) {
    const existing = projectId != null
      ? await this.getSongById(songId, projectId, userId)
      : (await this.getSongByIdForUser(songId, userId))?.song;

    if (!existing) {
      return false;
    }

    await db.delete(songsSchema).where(
      and(
        eq(songsSchema.id, songId),
        eq(songsSchema.userId, userId),
      ),
    );
    return true;
  }
}
