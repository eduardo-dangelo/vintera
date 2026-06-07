'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

type CreateMusicProjectMemberInput = {
  projectId: number;
  userId: string;
  permission?: MemberPermission;
  projectRoles?: string[];
};

export function useCreateMusicProjectMember(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...data }: CreateMusicProjectMemberInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Failed to add member');
      }
      return (await res.json()) as { member: MusicProjectMember };
    },
    onMutate: async ({ projectId, userId }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (previousDetail) {
        const optimisticMember: MusicProjectMember = {
          id: -1,
          name: userId,
          imageUrl: null,
          permission: 'edit',
          projectRoles: [],
        };

        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...previousDetail,
          members: [...previousDetail.members, optimisticMember],
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
    onSuccess: (response, { projectId }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      const cached = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (cached) {
        const withoutOptimistic = cached.members.filter(member => member.id !== -1);
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...cached,
          members: [...withoutOptimistic, response.member],
        });
      }

      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
    },
  });
}
