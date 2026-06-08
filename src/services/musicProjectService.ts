import type { MemberPermission } from '@/types/musicPeople';
import type { MusicProjectInput, UpdateMusicProjectInput } from '@/validations/MusicProjectValidation';
import { and, count, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { albumsSchema, musicProjectMembersSchema, musicProjectsSchema, songsSchema } from '@/models/Schema';
import { getMembersByProjectIds, insertOwnerMember } from '@/services/musicPeopleService';
import { omitStatus, omitStatusFromArray } from '@/utils/omitMusicStatus';
import { ensureUniqueSlug, slugify } from '@/utils/slugify';
import { toTitleCase } from '@/utils/toTitleCase';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type MusicProjectData = MusicProjectInput | UpdateMusicProjectInput;

export type ProjectViewerPermission = 'owner' | MemberPermission;

const MEMBER_PERMISSIONS: MemberPermission[] = ['read', 'edit', 'admin'];

function parseMemberPermission(value: string | null): MemberPermission {
  if (value && MEMBER_PERMISSIONS.includes(value as MemberPermission)) {
    return value as MemberPermission;
  }
  return 'admin';
}

async function getAccessibleProjectsForUser(userId: string) {
  const owned = await db
    .select()
    .from(musicProjectsSchema)
    .where(eq(musicProjectsSchema.userId, userId));

  const memberRows = await db
    .select({ project: musicProjectsSchema })
    .from(musicProjectMembersSchema)
    .innerJoin(
      musicProjectsSchema,
      eq(musicProjectMembersSchema.musicProjectId, musicProjectsSchema.id),
    )
    .where(eq(musicProjectMembersSchema.userId, userId));

  const byId = new Map<number, typeof owned[number]>();
  for (const project of owned) {
    byId.set(project.id, project);
  }
  for (const row of memberRows) {
    if (!byId.has(row.project.id)) {
      byId.set(row.project.id, row.project);
    }
  }

  return [...byId.values()].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

export class MusicProjectService {
  static async getUserProjectAccess(projectId: number, userId: string) {
    const [project] = await db
      .select()
      .from(musicProjectsSchema)
      .where(eq(musicProjectsSchema.id, projectId))
      .limit(1);

    if (!project) {
      return null;
    }

    if (project.userId === userId) {
      return {
        project: omitStatus(project),
        viewerPermission: 'owner' as const,
      };
    }

    const [member] = await db
      .select({ permission: musicProjectMembersSchema.permission })
      .from(musicProjectMembersSchema)
      .where(
        and(
          eq(musicProjectMembersSchema.musicProjectId, projectId),
          eq(musicProjectMembersSchema.userId, userId),
        ),
      )
      .limit(1);

    if (!member) {
      return null;
    }

    return {
      project: omitStatus(project),
      viewerPermission: parseMemberPermission(member.permission),
    };
  }

  static async getRecentProjectsByUserId(userId: string, limit = 5) {
    const projects = await getAccessibleProjectsForUser(userId);

    return projects.slice(0, limit).map(project => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      color: project.color,
      coverImageUrl: project.coverImageUrl,
      updatedAt: project.updatedAt,
    }));
  }

  static async getProjectsByUserId(userId: string) {
    const projects = await getAccessibleProjectsForUser(userId);

    const projectIds = projects.map(p => p.id);
    const membersByProject = await getMembersByProjectIds(projectIds);

    const withCounts = await Promise.all(
      projects.map(async (project) => {
        const projectWithoutStatus = omitStatus(project);
        const [albumCount] = await db
          .select({ value: count() })
          .from(albumsSchema)
          .where(eq(albumsSchema.musicProjectId, project.id));
        const [songCount] = await db
          .select({ value: count() })
          .from(songsSchema)
          .where(eq(songsSchema.musicProjectId, project.id));
        return {
          ...projectWithoutStatus,
          albumCount: albumCount?.value ?? 0,
          songCount: songCount?.value ?? 0,
          members: membersByProject.get(project.id) ?? [],
        };
      }),
    );

    return withCounts;
  }

  static async getProjectById(projectId: number, userId: string) {
    const access = await this.getUserProjectAccess(projectId, userId);
    return access?.project ?? null;
  }

  static async getProjectWithRelations(projectId: number, userId: string) {
    const access = await this.getUserProjectAccess(projectId, userId);
    if (!access) {
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

    const membersByProject = await getMembersByProjectIds([projectId]);

    return {
      project: access.project,
      albums: omitStatusFromArray(albums),
      songs: omitStatusFromArray(songs),
      members: membersByProject.get(projectId) ?? [],
      viewerPermission: access.viewerPermission,
    };
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
        name: toTitleCase(data.name),
        slug,
        description: data.description,
        genre: data.genre,
        color: data.color ?? null,
        coverImageUrl: data.coverImageUrl || null,
        metadata: data.metadata,
      })
      .returning();

    if (project) {
      await insertOwnerMember(project.id, userId);
      return omitStatus(project);
    }

    return project ? omitStatus(project) : project;
  }

  static async updateProject(
    projectId: number,
    data: UpdateMusicProjectInput,
    userId: string,
  ) {
    const existing = await this.getProjectById(projectId, userId);
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
    if (data.genre !== undefined) {
      updateData.genre = data.genre;
    }
    if (data.color !== undefined) {
      updateData.color = data.color;
    }
    if (data.coverImageUrl !== undefined) {
      updateData.coverImageUrl = data.coverImageUrl || null;
    }
    if (data.metadata !== undefined) {
      const existingMetadata = isRecord(existing.metadata) ? existing.metadata : {};
      updateData.metadata = { ...existingMetadata, ...data.metadata };
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

    if (!updated) {
      return null;
    }
    return omitStatus(updated);
  }

  static async deleteProject(projectId: number, userId: string) {
    const access = await this.getUserProjectAccess(projectId, userId);
    if (!access) {
      return { ok: false as const, reason: 'not_found' as const };
    }
    if (access.viewerPermission !== 'owner' && access.viewerPermission !== 'admin') {
      return { ok: false as const, reason: 'forbidden' as const };
    }

    await db
      .delete(musicProjectsSchema)
      .where(eq(musicProjectsSchema.id, projectId));

    return { ok: true as const };
  }
}
