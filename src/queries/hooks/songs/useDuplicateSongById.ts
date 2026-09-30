'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { musicProjectKeys, sidebarKeys, songKeys } from '@/queries/keys';

export function useDuplicateSongById(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ songId }: { songId: number }) => {
      const res = await fetch(`/${locale}/api/songs/${songId}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to duplicate song');
      }
      const { song } = (await res.json()) as { song: { id: number } };
      return song;
    },
    onSuccess: (song) => {
      queryClient.invalidateQueries({ queryKey: songKeys.list() });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.all });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.push(`/${locale}/songs/${song.id}`);
      router.refresh();
    },
  });
}
