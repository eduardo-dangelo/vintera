'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { albumKeys, musicProjectKeys, sidebarKeys } from '@/queries/keys';

export function useDuplicateAlbumById(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ albumId }: { albumId: number }) => {
      const res = await fetch(`/${locale}/api/albums/${albumId}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to duplicate album');
      }
      const { album } = (await res.json()) as { album: { id: number } };
      return album;
    },
    onSuccess: (album) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.all });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.push(`/${locale}/albums/${album.id}`);
      router.refresh();
    },
  });
}