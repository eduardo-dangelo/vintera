export const calendarFeedKeys = {
  all: ['calendar-feeds'] as const,
  project: (projectId: number) => [...calendarFeedKeys.all, 'project', projectId] as const,
};
