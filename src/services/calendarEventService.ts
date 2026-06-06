import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetsSchema, calendarEventsSchema, musicProjectsSchema } from '@/models/Schema';

export type EventReminders = {
  useDefault: boolean;
  overrides: { method: 'email' | 'popup'; minutes: number }[];
};

export type CalendarEventData = {
  assetId?: number | null;
  musicProjectId?: number | null;
  name: string;
  description?: string | null;
  location?: string | null;
  color?: string | null;
  start: Date;
  end: Date;
  reminders?: EventReminders | null;
};

export class CalendarEventService {
  private static async verifyAssetOwnership(assetId: number, userId: string) {
    const asset = await db
      .select()
      .from(assetsSchema)
      .where(
        and(
          eq(assetsSchema.id, assetId),
          eq(assetsSchema.userId, userId),
        ),
      )
      .limit(1);

    return asset.length > 0;
  }

  private static async verifyMusicProjectOwnership(projectId: number, userId: string) {
    const project = await db
      .select()
      .from(musicProjectsSchema)
      .where(
        and(
          eq(musicProjectsSchema.id, projectId),
          eq(musicProjectsSchema.userId, userId),
        ),
      )
      .limit(1);

    return project.length > 0;
  }

  static async create(eventData: CalendarEventData, userId: string) {
    const hasAsset = eventData.assetId != null;
    const hasProject = eventData.musicProjectId != null;

    if (hasAsset === hasProject) {
      throw new Error('Either assetId or musicProjectId is required, but not both');
    }

    if (hasAsset) {
      const hasAccess = await this.verifyAssetOwnership(eventData.assetId!, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }
    } else {
      const hasAccess = await this.verifyMusicProjectOwnership(eventData.musicProjectId!, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Music project not found or access denied');
      }
    }

    const [created] = await db
      .insert(calendarEventsSchema)
      .values({
        assetId: eventData.assetId ?? null,
        musicProjectId: eventData.musicProjectId ?? null,
        userId,
        name: eventData.name,
        description: eventData.description ?? null,
        location: eventData.location ?? null,
        color: eventData.color ?? null,
        start: eventData.start,
        end: eventData.end,
        reminders: eventData.reminders ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  static async getById(eventId: number, userId: string) {
    const [event] = await db
      .select()
      .from(calendarEventsSchema)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      )
      .limit(1);

    return event ?? null;
  }

  static async getByAssetId(assetId: number, userId: string) {
    const hasAccess = await this.verifyAssetOwnership(assetId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Asset not found or access denied');
    }

    return db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.assetId, assetId))
      .orderBy(calendarEventsSchema.start);
  }

  static async getByMusicProjectId(projectId: number, userId: string) {
    const hasAccess = await this.verifyMusicProjectOwnership(projectId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Music project not found or access denied');
    }

    return db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.musicProjectId, projectId))
      .orderBy(calendarEventsSchema.start);
  }

  static async getByUserId(userId: string) {
    return db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.userId, userId))
      .orderBy(calendarEventsSchema.start);
  }

  /** Events that have reminders with overrides and start on or after startAfter (for cron). */
  static async getEventsWithReminders(startAfter: Date) {
    return db
      .select()
      .from(calendarEventsSchema)
      .where(
        and(
          gte(calendarEventsSchema.start, startAfter),
          sql`${calendarEventsSchema.reminders} IS NOT NULL`,
          sql`jsonb_array_length(${calendarEventsSchema.reminders}->'overrides') > 0`,
        ),
      )
      .orderBy(calendarEventsSchema.start);
  }

  static async update(
    eventId: number,
    updates: Partial<CalendarEventData>,
    userId: string,
  ) {
    const existing = await this.getById(eventId, userId);
    if (!existing) {
      return null;
    }

    if (updates.assetId !== undefined && updates.assetId !== existing.assetId) {
      if (updates.assetId != null) {
        const hasAccess = await this.verifyAssetOwnership(updates.assetId, userId);
        if (!hasAccess) {
          throw new Error('Unauthorized: Asset not found or access denied');
        }
      }
    }

    if (updates.musicProjectId !== undefined && updates.musicProjectId !== existing.musicProjectId) {
      if (updates.musicProjectId != null) {
        const hasAccess = await this.verifyMusicProjectOwnership(updates.musicProjectId, userId);
        if (!hasAccess) {
          throw new Error('Unauthorized: Music project not found or access denied');
        }
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.location !== undefined) {
      updateData.location = updates.location;
    }
    if (updates.color !== undefined) {
      updateData.color = updates.color;
    }
    if (updates.start !== undefined) {
      updateData.start = updates.start;
    }
    if (updates.end !== undefined) {
      updateData.end = updates.end;
    }
    if (updates.assetId !== undefined) {
      updateData.assetId = updates.assetId;
    }
    if (updates.musicProjectId !== undefined) {
      updateData.musicProjectId = updates.musicProjectId;
    }
    if (updates.reminders !== undefined) {
      updateData.reminders = updates.reminders;
    }

    const [updated] = await db
      .update(calendarEventsSchema)
      .set(updateData as Record<string, unknown>)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      )
      .returning();

    return updated ?? null;
  }

  static async delete(eventId: number, userId: string) {
    await db
      .delete(calendarEventsSchema)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      );
    return true;
  }
}
