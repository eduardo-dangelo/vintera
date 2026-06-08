'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

type DeleteMusicProjectMemberInput = {
  projectId: number;
  memberId: number;
};

export function useDeleteMusicProjectMember(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, memberId }: DeleteMusicProjectMemberInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Failed to remove member');
      }
    },
    onMutate: async ({ projectId, memberId }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (previousDetail) {
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...previousDetail,
          members: previousDetail.members.filter(member => member.id !== memberId),
        });
      }

      return { previousDetail };
    },
    onError: (_error, { projectId }, context) => {
      const detailKey = musicProjectKeys.detail(projectId);
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
    },
  });
}
