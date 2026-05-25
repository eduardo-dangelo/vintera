export const sidebarKeys = {
  all: ['sidebar'] as const,
  recents: () => [...sidebarKeys.all, 'recents'] as const,
} as const;
