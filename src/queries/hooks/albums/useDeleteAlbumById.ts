'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { albumKeys, musicProjectKeys, sidebarKeys } from '@/queries/keys';

export function useDeleteAlbumById(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId }: { albumId: number }) => {
      const res = await fetch(`/${locale}/api/albums/${albumId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete album');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.all });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
    },
  });
}
