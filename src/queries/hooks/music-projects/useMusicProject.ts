'use client';

import { useQuery } from '@tanstack/react-query';
import { musicProjectKeys } from '@/queries/keys';

export type MusicProjectDetail = {
  project: {
    id: number;
    userId: string;
    name: string;
    slug: string;
    description: string | null;
    genre: string | null;
    color: string | null;
    status: string;
    coverImageUrl: string | null;
    metadata: unknown;
    linkedAssetId: number | null;
    createdAt: string;
    updatedAt: string;
  };
  albums: Array<{
    id: number;
    musicProjectId: number;
    name: string;
    description: string | null;
    releaseDate: string | null;
    coverImageUrl: string | null;
    sortOrder: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  songs: Array<{
    id: number;
    musicProjectId: number;
    albumId: number | null;
    title: string;
    trackNumber: number | null;
    durationSeconds: number | null;
    key: string | null;
    bpm: number | null;
    lyrics: string | null;
    chordsOrTabs: string | null;
    metadata: unknown;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export function useMusicProject(locale: string, projectId: number) {
  return useQuery({
    queryKey: musicProjectKeys.detail(projectId),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/music-projects/${projectId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch music project');
      }
      return (await res.json()) as MusicProjectDetail;
    },
    enabled: projectId > 0,
  });
}
