'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

type CreateMusicProjectInput = {
  name: string;
  description?: string;
  genre?: string;
  color?: string;
};

export function useCreateMusicProject(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: CreateMusicProjectInput) => {
      const res = await fetch(`/${locale}/api/music-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error('Failed to create music project');
      }
      const { project } = (await res.json()) as { project: { id: number } };
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.refresh();
    },
  });
}
