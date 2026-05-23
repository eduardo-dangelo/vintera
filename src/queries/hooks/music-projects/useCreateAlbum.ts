'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

type CreateAlbumInput = {
  projectId: number;
  name: string;
  description?: string;
  status?: 'draft' | 'released';
};

export function useCreateAlbum(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateAlbumInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to create album');
      }
      return (await res.json()) as { album: unknown };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
    },
  });
}
