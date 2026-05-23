'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

export function useDeleteMusicProject(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete music project');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
    },
  });
}
