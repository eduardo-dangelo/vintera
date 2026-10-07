'use client';

import type { CalendarFeedResponse } from './useGetOrCreateCalendarFeed';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarFeedKeys } from '@/queries/keys/calendar-feeds';

export function useRotateCalendarFeed(locale: string, projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/${locale}/api/music-projects/${projectId}/calendar-feed/rotate`,
        { method: 'POST' },
      );
      if (!res.ok) {
        throw new Error('Failed to rotate calendar subscribe link');
      }
      return (await res.json()) as CalendarFeedResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(calendarFeedKeys.project(projectId), data);
    },
  });
}
