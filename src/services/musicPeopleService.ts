import type { MemberPermission, MusicPersonPreview, MusicProjectMember } from '@/types/musicPeople';
import { and, asc, eq, inArray, max } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  musicProjectMembersSchema,
  musicProjectsSchema,
  songAuthorsSchema,
  usersSchema,
} from '@/models/Schema';

const MEMBER_PERMISSIONS: MemberPermission[] = ['read', 'edit', 'admin'];

function parseMemberPermission(value: string | null): MemberPermission {
  if (value && MEMBER_PERMISSIONS.includes(value as MemberPermission)) {
    return value as MemberPermission;
  }
  return 'admin';
}

function memberDisplayName(row: {
  displayName: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  userEmail: string;
}): string {
  if (row.displayName) {
    return row.displayName;
  }
  const parts = [row.userFirstName, row.userLastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return row.userEmail || 'Member';
}

export async function getMembersByProjectIds(
  projectIds: number[],
): Promise<Map<number, MusicProjectMember[]>> {
  const map = new Map<number, MusicProjectMember[]>();
  if (projectIds.length === 0) {
    return map;
  }

  const rows = await db
    .select({
      projectId: musicProjectMembersSchema.musicProjectId,
      id: musicProjectMembersSchema.id,
      displayName: musicProjectMembersSchema.displayName,
      memberImageUrl: musicProjectMembersSchema.imageUrl,
      userFirstName: usersSchema.firstName,
      userLastName: usersSchema.lastName,
      userEmail: usersSchema.email,
      userImageUrl: usersSchema.imageUrl,
      permission: musicProjectMembersSchema.permission,
      projectRoles: musicProjectMembersSchema.projectRoles,
      sortOrder: musicProjectMembersSchema.sortOrder,
    })
    .from(musicProjectMembersSchema)
    .leftJoin(usersSchema, eq(musicProjectMembersSchema.userId, usersSchema.id))
    .where(inArray(musicProjectMembersSchema.musicProjectId, projectIds))
    .orderBy(asc(musicProjectMembersSchema.sortOrder), asc(musicProjectMembersSchema.id));

  for (const row of rows) {
    const list = map.get(row.projectId) ?? [];
    list.push({
      id: row.id,
      name: memberDisplayName({
        displayName: row.displayName,
        userFirstName: row.userFirstName,
        userLastName: row.userLastName,
        userEmail: row.userEmail ?? '',
      }),
      imageUrl: row.memberImageUrl ?? row.userImageUrl ?? null,
      permission: parseMemberPermission(row.permission),
      projectRoles: row.projectRoles ?? [],
    });
    map.set(row.projectId, list);
  }

  return map;
}

export type UpdateProjectMemberInput = {
  permission?: MemberPermission;
  projectRoles?: string[];
};

export type CreateProjectMemberInput = {
  userId: string;
  permission?: MemberPermission;
  projectRoles?: string[];
};

export type CreateProjectMemberError = 'project_not_found' | 'user_not_found' | 'already_member';

export async function getMemberUserIdsByProjectId(projectId: number): Promise<string[]> {
  const rows = await db
    .select({ userId: musicProjectMembersSchema.userId })
    .from(musicProjectMembersSchema)
    .where(eq(musicProjectMembersSchema.musicProjectId, projectId));

  return rows
    .map(row => row.userId)
    .filter((userId): userId is string => userId != null);
}

export async function createProjectMember(
  projectId: number,
  ownerUserId: string,
  input: CreateProjectMemberInput,
): Promise<{ member: MusicProjectMember } | { error: CreateProjectMemberError }> {
  const [project] = await db
    .select({ id: musicProjectsSchema.id })
    .from(musicProjectsSchema)
    .where(
      and(
        eq(musicProjectsSchema.id, projectId),
        eq(musicProjectsSchema.userId, ownerUserId),
      ),
    )
    .limit(1);

  if (!project) {
    return { error: 'project_not_found' };
  }

  const [targetUser] = await db
    .select({ id: usersSchema.id })
    .from(usersSchema)
    .where(eq(usersSchema.id, input.userId))
    .limit(1);

  if (!targetUser) {
    return { error: 'user_not_found' };
  }

  const [existingMember] = await db
    .select({ id: musicProjectMembersSchema.id })
    .from(musicProjectMembersSchema)
    .where(
      and(
        eq(musicProjectMembersSchema.musicProjectId, projectId),
        eq(musicProjectMembersSchema.userId, input.userId),
      ),
    )
    .limit(1);

  if (existingMember) {
    return { error: 'already_member' };
  }

  const [sortResult] = await db
    .select({ maxSort: max(musicProjectMembersSchema.sortOrder) })
    .from(musicProjectMembersSchema)
    .where(eq(musicProjectMembersSchema.musicProjectId, projectId));

  const nextSortOrder = (sortResult?.maxSort ?? -1) + 1;

  const [inserted] = await db
    .insert(musicProjectMembersSchema)
    .values({
      musicProjectId: projectId,
      userId: input.userId,
      permission: input.permission ?? 'edit',
      projectRoles: input.projectRoles ?? [],
      sortOrder: nextSortOrder,
    })
    .returning({ id: musicProjectMembersSchema.id });

  if (!inserted) {
    return { error: 'user_not_found' };
  }

  const members = await getMembersByProjectIds([projectId]);
  const member = members.get(projectId)?.find(m => m.id === inserted.id) ?? null;

  if (!member) {
    return { error: 'user_not_found' };
  }

  return { member };
}

export async function updateProjectMember(
  projectId: number,
  memberId: number,
  userId: string,
  patch: UpdateProjectMemberInput,
): Promise<MusicProjectMember | null> {
  const [project] = await db
    .select({ id: musicProjectsSchema.id })
    .from(musicProjectsSchema)
    .where(
      and(
        eq(musicProjectsSchema.id, projectId),
        eq(musicProjectsSchema.userId, userId),
      ),
    )
    .limit(1);

  if (!project) {
    return null;
  }

  const [existing] = await db
    .select({ id: musicProjectMembersSchema.id })
    .from(musicProjectMembersSchema)
    .where(
      and(
        eq(musicProjectMembersSchema.id, memberId),
        eq(musicProjectMembersSchema.musicProjectId, projectId),
      ),
    )
    .limit(1);

  if (!existing) {
    return null;
  }

  const updates: Partial<typeof musicProjectMembersSchema.$inferInsert> = {};
  if (patch.permission !== undefined) {
    updates.permission = patch.permission;
  }
  if (patch.projectRoles !== undefined) {
    updates.projectRoles = patch.projectRoles;
  }

  if (Object.keys(updates).length === 0) {
    const members = await getMembersByProjectIds([projectId]);
    return members.get(projectId)?.find(m => m.id === memberId) ?? null;
  }

  await db
    .update(musicProjectMembersSchema)
    .set(updates)
    .where(eq(musicProjectMembersSchema.id, memberId));

  const members = await getMembersByProjectIds([projectId]);
  return members.get(projectId)?.find(m => m.id === memberId) ?? null;
}

export async function getAuthorsBySongIds(
  songIds: number[],
): Promise<Map<number, MusicPersonPreview[]>> {
  const map = new Map<number, MusicPersonPreview[]>();
  if (songIds.length === 0) {
    return map;
  }

  const rows = await db
    .select({
      songId: songAuthorsSchema.songId,
      id: musicProjectMembersSchema.id,
      displayName: musicProjectMembersSchema.displayName,
      memberImageUrl: musicProjectMembersSchema.imageUrl,
      userFirstName: usersSchema.firstName,
      userLastName: usersSchema.lastName,
      userEmail: usersSchema.email,
      userImageUrl: usersSchema.imageUrl,
      sortOrder: songAuthorsSchema.sortOrder,
    })
    .from(songAuthorsSchema)
    .innerJoin(
      musicProjectMembersSchema,
      eq(songAuthorsSchema.memberId, musicProjectMembersSchema.id),
    )
    .leftJoin(usersSchema, eq(musicProjectMembersSchema.userId, usersSchema.id))
    .where(inArray(songAuthorsSchema.songId, songIds))
    .orderBy(asc(songAuthorsSchema.sortOrder), asc(songAuthorsSchema.id));

  for (const row of rows) {
    const list = map.get(row.songId) ?? [];
    list.push({
      id: row.id,
      name: memberDisplayName({
        displayName: row.displayName,
        userFirstName: row.userFirstName,
        userLastName: row.userLastName,
        userEmail: row.userEmail ?? '',
      }),
      imageUrl: row.memberImageUrl ?? row.userImageUrl ?? null,
    });
    map.set(row.songId, list);
  }

  return map;
}

export async function insertOwnerMember(projectId: number, userId: string) {
  const [existing] = await db
    .select({ id: musicProjectMembersSchema.id })
    .from(musicProjectMembersSchema)
    .where(
      and(
        eq(musicProjectMembersSchema.musicProjectId, projectId),
        eq(musicProjectMembersSchema.userId, userId),
      ),
    )
    .limit(1);

  if (!existing) {
    await db.insert(musicProjectMembersSchema).values({
      musicProjectId: projectId,
      userId,
      sortOrder: 0,
    });
  }
}
