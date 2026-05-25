'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { albumKeys, musicProjectKeys, sidebarKeys, songKeys } from '@/queries/keys';

export function useUpdateSongById(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId, data }: { songId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`/${locale}/api/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to update song');
      }
      return (await res.json()) as { song: { musicProjectId: number } };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: songKeys.detail(variables.songId) });
      queryClient.invalidateQueries({ queryKey: songKeys.list() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      if (_data?.song?.musicProjectId) {
        queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(_data.song.musicProjectId) });
      }
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}
