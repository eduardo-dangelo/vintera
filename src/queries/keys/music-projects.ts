export const musicProjectKeys = {
  all: ['music-projects'] as const,
  lists: () => [...musicProjectKeys.all, 'list'] as const,
  list: () => [...musicProjectKeys.lists()] as const,
  details: () => [...musicProjectKeys.all, 'detail'] as const,
  detail: (id: number) => [...musicProjectKeys.details(), id] as const,
  albums: (projectId: number) => [...musicProjectKeys.detail(projectId), 'albums'] as const,
  songs: (projectId: number) => [...musicProjectKeys.detail(projectId), 'songs'] as const,
} as const;
