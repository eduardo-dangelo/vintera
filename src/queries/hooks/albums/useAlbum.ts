'use client';

import { useQuery } from '@tanstack/react-query';
import { albumKeys } from '@/queries/keys';

export type AlbumDetail = {
  id: number;
  musicProjectId: number;
  name: string;
  description: string | null;
  releaseDate: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AlbumProjectSummary = {
  id: number;
  name: string;
  color: string | null;
  slug: string;
};

export function useAlbum(locale: string, albumId: number) {
  return useQuery({
    queryKey: albumKeys.detail(albumId),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/albums/${albumId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch album');
      }
      return (await res.json()) as { album: AlbumDetail; project: AlbumProjectSummary };
    },
    enabled: albumId > 0,
  });
}
