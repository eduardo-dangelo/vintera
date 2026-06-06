'use client';

import type { CalendarEventData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { CalendarEvent } from '@/entities';
import { calendarEventKeys } from '@/queries/keys';

export function useGetCalendarEventsByProject(
  locale: string,
  projectId: number | null | undefined,
) {
  return useQuery({
    queryKey: calendarEventKeys.list({ musicProjectId: projectId ?? 0 }),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/calendar-events?musicProjectId=${projectId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      const { events } = (await res.json()) as { events: CalendarEventData[] };
      return (events ?? []).map((e: CalendarEventData) => CalendarEvent.fromApi(e));
    },
    enabled: typeof projectId === 'number' && projectId > 0,
  });
}
