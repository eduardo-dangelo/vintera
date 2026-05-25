'use client';

import { useQuery } from '@tanstack/react-query';
import { songKeys } from '@/queries/keys';

export type SongDetail = {
  id: number;
  musicProjectId: number;
  albumId: number | null;
  title: string;
  trackNumber: number | null;
  durationSeconds: number | null;
  key: string | null;
  bpm: number | null;
  lyrics: string | null;
  chordsOrTabs: string | null;
  metadata: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SongProjectSummary = {
  id: number;
  name: string;
  color: string | null;
  slug: string;
};

export function useSong(locale: string, songId: number) {
  return useQuery({
    queryKey: songKeys.detail(songId),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/songs/${songId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch song');
      }
      return (await res.json()) as { song: SongDetail; project: SongProjectSummary };
    },
    enabled: songId > 0,
  });
}
