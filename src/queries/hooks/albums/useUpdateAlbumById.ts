'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { albumKeys, musicProjectKeys, sidebarKeys } from '@/queries/keys';

export function useUpdateAlbumById(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, data }: { albumId: number; data: Record<string, unknown> }) => {
      const res = await fetch(`/${locale}/api/albums/${albumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to update album');
      }
      return (await res.json()) as { album: { musicProjectId: number } };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) });
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      if (_data?.album?.musicProjectId) {
        queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(_data.album.musicProjectId) });
      }
    },
  });
}
