'use client';

import { useQuery } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

export type MusicProjectListItem = {
  id: number;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  genre: string | null;
  color: string | null;
  status: string;
  coverImageUrl: string | null;
  metadata: unknown;
  linkedAssetId: number | null;
  createdAt: Date;
  updatedAt: Date;
  albumCount: number;
  songCount: number;
};

export function useMusicProjects(locale: string) {
  return useQuery({
    queryKey: musicProjectKeys.list(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/music-projects`);
      if (!res.ok) {
        throw new Error('Failed to fetch music projects');
      }
      const { projects } = (await res.json()) as { projects: MusicProjectListItem[] };
      return projects ?? [];
    },
  });
}
