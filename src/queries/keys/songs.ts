export const songKeys = {
  all: ['songs'] as const,
  lists: () => [...songKeys.all, 'list'] as const,
  list: () => [...songKeys.lists()] as const,
  details: () => [...songKeys.all, 'detail'] as const,
  detail: (id: number) => [...songKeys.details(), id] as const,
} as const;
