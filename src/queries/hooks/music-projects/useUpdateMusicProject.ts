'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { musicProjectKeys, sidebarKeys } from '@/queries/keys';

type UpdateMusicProjectInput = {
  projectId: number;
  data: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function applyMusicProjectPatch(
  project: MusicProjectDetail['project'],
  data: Record<string, unknown>,
): MusicProjectDetail['project'] {
  const next = { ...project };

  if (typeof data.name === 'string') {
    next.name = data.name;
  }
  if (data.color !== undefined) {
    next.color = typeof data.color === 'string' ? data.color : null;
  }
  if (data.coverImageUrl !== undefined) {
    next.coverImageUrl = typeof data.coverImageUrl === 'string' ? data.coverImageUrl : null;
  }
  if (data.description !== undefined) {
    next.description = typeof data.description === 'string' ? data.description : null;
  }
  if (data.genre !== undefined) {
    next.genre = typeof data.genre === 'string' ? data.genre : null;
  }
  if (data.metadata !== undefined && isRecord(data.metadata)) {
    const existing = isRecord(project.metadata) ? project.metadata : {};
    next.metadata = { ...existing, ...data.metadata };
  }

  return next;
}

function patchMusicProjectList(
  projects: MusicProjectListItem[],
  projectId: number,
  data: Record<string, unknown>,
): MusicProjectListItem[] {
  return projects.map((item) => {
    if (item.id !== projectId) {
      return item;
    }

    const next: MusicProjectListItem = { ...item };

    if (typeof data.name === 'string') {
      next.name = data.name;
    }
    if (data.color !== undefined) {
      next.color = typeof data.color === 'string' ? data.color : null;
    }
    if (data.coverImageUrl !== undefined) {
      next.coverImageUrl = typeof data.coverImageUrl === 'string' ? data.coverImageUrl : null;
    }
    if (data.description !== undefined) {
      next.description = typeof data.description === 'string' ? data.description : null;
    }
    if (data.genre !== undefined) {
      next.genre = typeof data.genre === 'string' ? data.genre : null;
    }
    if (data.metadata !== undefined && isRecord(data.metadata)) {
      const existing = isRecord(item.metadata) ? item.metadata : {};
      next.metadata = { ...existing, ...data.metadata };
    }

    return next;
  });
}

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
      return (await res.json()) as { project: MusicProjectDetail['project'] };
    },
    onMutate: async ({ projectId, data }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      const listKey = musicProjectKeys.list();

      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousDetail = queryClient.getQueryData<MusicProjectDetail>(detailKey);
      const previousList = queryClient.getQueryData<MusicProjectListItem[]>(listKey);

      if (previousDetail) {
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...previousDetail,
          project: applyMusicProjectPatch(previousDetail.project, data),
        });
      }

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          patchMusicProjectList(previousList, projectId, data),
        );
      }

      return { previousDetail, previousList };
    },
    onError: (_error, { projectId }, context) => {
      const detailKey = musicProjectKeys.detail(projectId);
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(detailKey, context.previousDetail);
      }
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(musicProjectKeys.list(), context.previousList);
      }
    },
    onSuccess: (response, { projectId }) => {
      const detailKey = musicProjectKeys.detail(projectId);
      const cached = queryClient.getQueryData<MusicProjectDetail>(detailKey);

      if (cached?.project && response.project) {
        queryClient.setQueryData<MusicProjectDetail>(detailKey, {
          ...cached,
          project: { ...cached.project, ...response.project },
        });
      }

      queryClient.invalidateQueries({ queryKey: musicProjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sidebarKeys.recents() });
    },
  });
}
