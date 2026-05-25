import type { MusicProjectInput, UpdateMusicProjectInput } from '@/validations/MusicProjectValidation';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import { ensureUniqueSlug, slugify } from '@/utils/slugify';

export type MusicProjectData = MusicProjectInput | UpdateMusicProjectInput;

export class MusicProjectService {
  static async getRecentProjectsByUserId(userId: string, limit = 5) {
    return db
      .select({
        id: musicProjectsSchema.id,
        name: musicProjectsSchema.name,
        slug: musicProjectsSchema.slug,
        color: musicProjectsSchema.color,
        updatedAt: musicProjectsSchema.updatedAt,
      })
      .from(musicProjectsSchema)
      .where(eq(musicProjectsSchema.userId, userId))
      .orderBy(desc(musicProjectsSchema.updatedAt))
      .limit(limit);
  }

  static async getProjectsByUserId(userId: string) {
    const projects = await db
      .select()
      .from(musicProjectsSchema)
      .where(eq(musicProjectsSchema.userId, userId))
      .orderBy(desc(musicProjectsSchema.updatedAt));

    const withCounts = await Promise.all(
      projects.map(async (project) => {
        const [albumCount] = await db
          .select({ value: count() })
          .from(albumsSchema)
          .where(eq(albumsSchema.musicProjectId, project.id));
        const [songCount] = await db
          .select({ value: count() })
          .from(songsSchema)
          .where(eq(songsSchema.musicProjectId, project.id));
        return {
          ...project,
          albumCount: albumCount?.value ?? 0,
          songCount: songCount?.value ?? 0,
        };
      }),
    );

    return withCounts;
  }

  static async getProjectById(projectId: number, userId: string) {
    const [project] = await db
      .select()
      .from(musicProjectsSchema)
      .where(
        and(
          eq(musicProjectsSchema.id, projectId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .limit(1);

    return project ?? null;
  }

  static async getProjectWithRelations(projectId: number, userId: string) {
    const project = await this.getProjectById(projectId, userId);
    if (!project) {
      return null;
    }

    const albums = await db
      .select()
      .from(albumsSchema)
      .where(eq(albumsSchema.musicProjectId, projectId))
      .orderBy(albumsSchema.sortOrder, albumsSchema.name);

    const songs = await db
      .select()
      .from(songsSchema)
      .where(eq(songsSchema.musicProjectId, projectId))
      .orderBy(songsSchema.trackNumber, songsSchema.title);

    return { project, albums, songs };
  }

  static async createProject(data: MusicProjectInput, userId: string) {
    const baseSlug = slugify(data.slug ?? data.name);
    const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
      const [existing] = await db
        .select({ id: musicProjectsSchema.id })
        .from(musicProjectsSchema)
        .where(
          and(
            eq(musicProjectsSchema.userId, userId),
            eq(musicProjectsSchema.slug, candidate),
          ),
        )
        .limit(1);
      return !!existing;
    });

    const [project] = await db
      .insert(musicProjectsSchema)
      .values({
        userId,
        name: data.name,
        slug,
        description: data.description,
        genre: data.genre,
        color: data.color ?? '#7c3aed',
        status: data.status ?? 'active',
        coverImageUrl: data.coverImageUrl || null,
        metadata: data.metadata,
      })
      .returning();

    return project;
  }

  static async updateProject(
    projectId: number,
    data: UpdateMusicProjectInput,
    userId: string,
  ) {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.genre !== undefined) {
      updateData.genre = data.genre;
    }
    if (data.color !== undefined) {
      updateData.color = data.color;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl || null;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }
    if (data.slug !== undefined) {
      const baseSlug = slugify(data.slug);
      updateData.slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
        const [existing] = await db
          .select({ id: musicProjectsSchema.id })
          .from(musicProjectsSchema)
          .where(
            and(
              eq(musicProjectsSchema.userId, userId),
              eq(musicProjectsSchema.slug, candidate),
            ),
          )
          .limit(1);
        return !!existing && existing.id !== projectId;
      });
    }

    const [updated] = await db
      .update(musicProjectsSchema)
      .set(updateData)
      .where(
        and(
          eq(musicProjectsSchema.id, projectId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .returning();

    return updated ?? null;
  }

  static async deleteProject(projectId: number, userId: string) {
    await db
      .delete(musicProjectsSchema)
      .where(
        and(
          eq(musicProjectsSchema.id, projectId),
          eq(musicProjectsSchema.userId, userId),
        ),
      );
    return true;
  }
}
