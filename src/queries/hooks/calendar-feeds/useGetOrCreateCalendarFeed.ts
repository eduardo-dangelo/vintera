'use client';

import { useQuery } from '@tanstack/react-query';
import { calendarFeedKeys } from '@/queries/keys/calendar-feeds';

export type CalendarFeedResponse = {
  url: string;
  token: string;
};

export function useGetOrCreateCalendarFeed(
  locale: string,
  projectId: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: calendarFeedKeys.project(projectId ?? 0),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/calendar-feed`);
      if (!res.ok) {
        throw new Error('Failed to load calendar subscribe link');
      }
      return (await res.json()) as CalendarFeedResponse;
    },
    enabled: enabled && typeof projectId === 'number' && projectId > 0,
  });
}
