export const sidebarKeys = {
  all: ['sidebar'] as const,
  recents: () => [...sidebarKeys.all, 'recents'] as const,
  recentsByLimit: (limit: number | 'all') => [...sidebarKeys.recents(), limit] as const,
} as const;
