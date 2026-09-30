'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

export function useDuplicateMusicProject(locale: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to duplicate music project');
      }
      const { project } = (await res.json()) as { project: { id: number } };
      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
      router.push(`/${locale}/projects/${project.id}`);
      router.refresh();
    },
  });
}
