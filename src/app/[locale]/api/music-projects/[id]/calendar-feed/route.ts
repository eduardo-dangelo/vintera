import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { CalendarFeedService } from '@/services/calendarFeedService';
import { getCalendarFeedUrl } from '@/utils/icsCalendarFeed';

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedHost) {
    return `${forwardedProto ?? 'https'}://${forwardedHost}`;
  }
  return url.origin;
}

async function handleGetOrCreate(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const feed = await CalendarFeedService.getOrCreateForProject(projectId, user.id);
    const url = getCalendarFeedUrl(requestOrigin(request), feed.token);

    return NextResponse.json({ url, token: feed.token });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.startsWith('Unauthorized')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    logger.error(`Error getting calendar feed: ${message}`);
    return NextResponse.json({ error: 'Failed to get calendar feed' }, { status: 500 });
  }
}

export const GET = handleGetOrCreate;
export const POST = handleGetOrCreate;
