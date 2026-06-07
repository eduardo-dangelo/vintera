'use client';

import type { PlatformUserSearchResult } from '@/types/musicPeople';
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/queries/keys';

type UseSearchUsersOptions = {
  projectId?: number;
  enabled?: boolean;
};

export function useSearchUsers(
  locale: string,
  query: string,
  options?: UseSearchUsersOptions,
) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: userKeys.search(trimmed, options?.projectId),
    queryFn: async () => {
      const params = new URLSearchParams({ q: trimmed });
      if (options?.projectId) {
        params.set('projectId', String(options.projectId));
      }

      const res = await fetch(`/${locale}/api/users/search?${params}`);
      if (!res.ok) {
        throw new Error('Failed to search users');
      }

      return (await res.json()) as { users: PlatformUserSearchResult[] };
    },
    enabled: (options?.enabled ?? true) && trimmed.length >= 2,
    staleTime: 30_000,
  });
}
