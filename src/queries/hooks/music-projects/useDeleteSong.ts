'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

export function useDeleteSong(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, songId }: { projectId: number; songId: number }) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/songs/${songId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete song');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
    },
  });
}
