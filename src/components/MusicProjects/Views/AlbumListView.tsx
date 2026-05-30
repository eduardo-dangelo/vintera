'use client';

import type { AlbumListItem } from '@/queries/hooks/albums';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MusicListTable } from './MusicListTable';

type AlbumListViewProps = {
  albums: AlbumListItem[];
  locale: string;
};

function buildAlbumSubtitle(album: AlbumListItem) {
  let subtitle = `Album • ${album.projectName}`;
  if (album.status) {
    subtitle += ` · ${album.status}`;
  }
  return subtitle;
}

export function AlbumListView({ albums, locale }: AlbumListViewProps) {
  const router = useRouter();

  return (
    <MusicListTable
      rows={albums.map(album => ({
        id: album.id,
        coverImageUrl: album.coverImageUrl,
        coverType: 'album' as const,
        title: album.name,
        subtitle: buildAlbumSubtitle(album),
        trailing: format(new Date(album.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/albums/${album.id}`),
      }))}
    />
  );
}
