export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: () => [...albumKeys.lists()] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
} as const;
