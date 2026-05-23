'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

type UpdateSongInput = {
  projectId: number;
  songId: number;
  data: Record<string, unknown>;
};

export function useUpdateSong(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, songId, data }: UpdateSongInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to update song');
      }
      return (await res.json()) as { song: unknown };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(variables.projectId) });
    },
  });
}
