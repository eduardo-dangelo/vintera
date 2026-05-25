'use client';

import type { SidebarRecents } from '@/services/sidebarService';
import { useQuery } from '@tanstack/react-query';
import { sidebarKeys } from '@/queries/keys';

export function useGetSidebarRecents(locale: string) {
  return useQuery({
    queryKey: sidebarKeys.recents(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/sidebar/recents`);
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
