'use client';

import { useQuery } from '@tanstack/react-query';
import { albumKeys } from '@/queries/keys';

export type AlbumListItem = {
  id: number;
  name: string;
  musicProjectId: number;
  status: string;
  updatedAt: Date;
  projectName: string;
  projectColor: string | null;
};

export function useAlbums(locale: string) {
  return useQuery({
    queryKey: albumKeys.list(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/albums`);
      if (!res.ok) {
        throw new Error('Failed to fetch albums');
      }
      const { albums } = (await res.json()) as { albums: AlbumListItem[] };
      return albums ?? [];
    },
  });
}
