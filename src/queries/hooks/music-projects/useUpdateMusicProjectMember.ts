'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

type UpdateMusicProjectMemberInput = {
  projectId: number;
  memberId: number;
  data: {
    permission?: MemberPermission;
    projectRoles?: string[];
  };
};

function patchMember(
  members: MusicProjectMember[],
  memberId: number,
  data: UpdateMusicProjectMemberInput['data'],
): MusicProjectMember[] {
  return members.map((member) => {
    if (member.id !== memberId) {
      return member;
    }
    return {
      ...member,
      ...(data.permission !== undefined ? { permission: data.permission } : {}),
      ...(data.projectRoles !== undefined ? { projectRoles: data.projectRoles } : {}),
    };
  });
}

export function useUpdateMusicProjectMember(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, memberId, data }: UpdateMusicProjectMemberInput) => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to update member');
      }
      return (await res.json()) as { member: MusicProjectMember };
    },
    onMutate: async ({ projectId, memberId, data }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (previousDetail) {
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...previousDetail,
          members: patchMember(previousDetail.members, memberId, data),
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
    onSuccess: (response, { projectId, memberId }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      const cached = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (cached) {
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...cached,
          members: patchMember(cached.members, memberId, {
            permission: response.member.permission,
            projectRoles: response.member.projectRoles,
          }),
        });
      }
    },
  });
}
