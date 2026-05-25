'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

type CreateSongInput = {
  projectId: number;
  title: string;
  albumId?: number | null;
  status?: 'idea' | 'demo' | 'recording' | 'released';
  lyrics?: string;
  chordsOrTabs?: string;
};

export function useCreateSong(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateSongInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to create song');
      }
      return (await res.json()) as { song: unknown };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.refresh();
    },
  });
}
