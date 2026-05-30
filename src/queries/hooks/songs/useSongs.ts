'use client';

import { useQuery } from '@tanstack/react-query';
import { songKeys } from '@/queries/keys';

export type SongListItem = {
  id: number;
  title: string;
  musicProjectId: number;
  albumId: number | null;
  status: string;
  updatedAt: Date;
  projectName: string;
  projectColor: string | null;
  albumName: string | null;
  coverImageUrl: string | null;
};

export function useSongs(locale: string) {
  return useQuery({
    queryKey: songKeys.list(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/songs`);
      if (!res.ok) {
        throw new Error('Failed to fetch songs');
      }
      const { songs } = (await res.json()) as { songs: SongListItem[] };
      return songs ?? [];
    },
  });
}
