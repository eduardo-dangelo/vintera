import type { MusicPersonPreview } from '@/types/musicPeople';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  musicProjectMembersSchema,
  songAuthorsSchema,
  usersSchema,
} from '@/models/Schema';

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
): Promise<Map<number, MusicPersonPreview[]>> {
  const map = new Map<number, MusicPersonPreview[]>();
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
    });
    map.set(row.projectId, list);
  }

  return map;
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
