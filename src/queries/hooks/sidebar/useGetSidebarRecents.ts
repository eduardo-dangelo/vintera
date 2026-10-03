'use client';

import type { SidebarRecents } from '@/services/sidebarService';
import { useQuery } from '@tanstack/react-query';
import { sidebarKeys } from '@/queries/keys';

export type SidebarRecentsLimit = number | 'all';

type UseGetSidebarRecentsOptions = {
  limit?: SidebarRecentsLimit;
  enabled?: boolean;
};

export function useGetSidebarRecents(
  locale: string,
  options: UseGetSidebarRecentsOptions = {},
) {
  const limit = options.limit ?? 5;
  const enabled = options.enabled ?? true;

  return useQuery({
    queryKey: sidebarKeys.recentsByLimit(limit),
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      const res = await fetch(`/${locale}/api/sidebar/recents?${params}`);
      if (res.status === 401) {
        return { projects: [], songs: [], albums: [] } satisfies SidebarRecents;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch sidebar recents');
      }
      return (await res.json()) as SidebarRecents;
    },
  });
}
