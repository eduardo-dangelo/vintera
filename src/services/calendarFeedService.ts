import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  calendarEventsSchema,
  calendarFeedsSchema,
  musicProjectsSchema,
} from '@/models/Schema';
import { MusicProjectService } from '@/services/musicProjectService';

function newFeedToken(): string {
  return randomBytes(32).toString('base64url');
}

async function verifyProjectAccess(
  projectId: number,
  userId: string,
  requireEdit: boolean,
) {
  const access = await MusicProjectService.getUserProjectAccess(projectId, userId);
  if (!access) {
    return false;
  }
  if (!requireEdit) {
    return true;
  }
  return access.viewerPermission === 'owner'
    || access.viewerPermission === 'edit'
    || access.viewerPermission === 'admin';
}

export class CalendarFeedService {
  static async getOrCreateForProject(projectId: number, userId: string) {
    const hasAccess = await verifyProjectAccess(projectId, userId, false);
    if (!hasAccess) {
      throw new Error('Unauthorized: Music project not found or access denied');
    }

    const [existing] = await db
      .select()
      .from(calendarFeedsSchema)
      .where(eq(calendarFeedsSchema.musicProjectId, projectId))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await db
      .insert(calendarFeedsSchema)
      .values({
        token: newFeedToken(),
        musicProjectId: projectId,
        createdByUserId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created!;
  }

  static async rotateForProject(projectId: number, userId: string) {
    const hasAccess = await verifyProjectAccess(projectId, userId, true);
    if (!hasAccess) {
      throw new Error('Unauthorized: Music project not found or access denied');
    }

    const [existing] = await db
      .select()
      .from(calendarFeedsSchema)
      .where(eq(calendarFeedsSchema.musicProjectId, projectId))
      .limit(1);

    const token = newFeedToken();
    const now = new Date();

    if (existing) {
      const [updated] = await db
        .update(calendarFeedsSchema)
        .set({
          token,
          updatedAt: now,
        })
        .where(eq(calendarFeedsSchema.id, existing.id))
        .returning();
      return updated!;
    }

    const [created] = await db
      .insert(calendarFeedsSchema)
      .values({
        token,
        musicProjectId: projectId,
        createdByUserId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created!;
  }

  static async getFeedPayloadByToken(token: string) {
    const [feed] = await db
      .select()
      .from(calendarFeedsSchema)
      .where(eq(calendarFeedsSchema.token, token))
      .limit(1);

    if (!feed) {
      return null;
    }

    const [project] = await db
      .select({
        id: musicProjectsSchema.id,
        name: musicProjectsSchema.name,
      })
      .from(musicProjectsSchema)
      .where(eq(musicProjectsSchema.id, feed.musicProjectId))
      .limit(1);

    if (!project) {
      return null;
    }

    const events = await db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.musicProjectId, feed.musicProjectId))
      .orderBy(calendarEventsSchema.start);

    return { feed, project, events };
  }
}
