export const userKeys = {
  all: ['users'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
  search: (query: string, projectId?: number) =>
    [...userKeys.all, 'search', query, projectId ?? 'none'] as const,
} as const;
