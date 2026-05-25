'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys, sidebarKeys, songKeys } from '@/queries/keys';

export function useDeleteSongById(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ songId }: { songId: number }) => {
      const res = await fetch(`/${locale}/api/songs/${songId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete song');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: songKeys.detail(variables.songId) });
      queryClient.invalidateQueries({ queryKey: songKeys.list() });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.all });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
    },
  });
}
