'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { albumKeys, musicProjectKeys, sidebarKeys, songKeys } from '@/queries/keys';

type CreateSongInput = {
  projectId?: number;
  title: string;
  albumId?: number | null;
  lyrics?: string;
  chordsOrTabs?: string;
};

export function useCreateSong(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateSongInput) => {
      if (projectId != null) {
        const res = await fetch(`/${locale}/api/music-projects/${projectId}/songs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          throw new Error('Failed to create song');
        }
        const { song } = (await res.json()) as { song: { id: number } };
        return song;
      }

      const res = await fetch(`/${locale}/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId: null }),
      });
      if (!res.ok) {
        throw new Error('Failed to create song');
      }
      const { song } = (await res.json()) as { song: { id: number } };
      return song;
    },
    onSuccess: (song, variables) => {
      const createdProjectId = variables.projectId;
      if (createdProjectId != null) {
        const detailKey = musicProjectKeys.detail(createdProjectId);
        const now = new Date().toISOString();
        queryClient.setQueryData<MusicProjectDetail>(detailKey, (current) => {
          if (!current || current.songs.some(item => item.id === song.id)) {
            return current;
          }
          return {
            ...current,
            songs: [...current.songs, {
              id: song.id,
              musicProjectId: createdProjectId,
              albumId: variables.albumId ?? null,
              title: variables.title,
              trackNumber: null,
              durationSeconds: null,
              key: null,
              bpm: null,
              lyrics: variables.lyrics ?? null,
              chordsOrTabs: variables.chordsOrTabs ?? null,
              metadata: null,
              createdAt: now,
              updatedAt: now,
            }],
          };
        });
        queryClient.invalidateQueries({ queryKey: detailKey });
      }
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: songKeys.list() });
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.refresh();
    },
  });
}
