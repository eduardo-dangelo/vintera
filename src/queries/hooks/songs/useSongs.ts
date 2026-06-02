'use client';

import type { MusicPersonPreview } from '@/types/musicPeople';
import { useQuery } from '@tanstack/react-query';
import { songKeys } from '@/queries/keys';

export type SongListItem = {
  id: number;
  title: string;
  musicProjectId: number | null;
  albumId: number | null;
  updatedAt: Date;
  projectName: string | null;
  projectColor: string | null;
  albumName: string | null;
  coverImageUrl: string | null;
  authors: MusicPersonPreview[];
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
