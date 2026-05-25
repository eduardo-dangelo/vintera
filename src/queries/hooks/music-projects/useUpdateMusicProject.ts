'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

type UpdateMusicProjectInput = {
  projectId: number;
  data: Record<string, unknown>;
};

export function useUpdateMusicProject(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: UpdateMusicProjectInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to update music project');
      }
      return (await res.json()) as { project: unknown };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
    },
  });
}
