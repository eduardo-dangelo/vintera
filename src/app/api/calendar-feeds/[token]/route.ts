import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { CalendarFeedService } from '@/services/calendarFeedService';
import {
  buildIcsCalendar,
  icsFilenameFromCalendarName,
} from '@/utils/icsCalendarFeed';

type RouteProps = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, props: RouteProps) {
  try {
    const { token: rawToken } = await props.params;
    const token = decodeURIComponent(rawToken ?? '').trim();
    if (!token) {
      return new NextResponse('Not found', { status: 404 });
    }

    const payload = await CalendarFeedService.getFeedPayloadByToken(token);
    if (!payload) {
      return new NextResponse('Not found', { status: 404 });
    }

    const ics = buildIcsCalendar({
      calendarName: payload.project.name,
      events: payload.events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        updatedAt: event.updatedAt,
      })),
    });

    const filename = icsFilenameFromCalendarName(payload.project.name);

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logger.error(
      `Error serving calendar feed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
