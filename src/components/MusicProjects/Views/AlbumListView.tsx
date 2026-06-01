'use client';

import type { AlbumListItem } from '@/queries/hooks/albums';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MusicStatBadge } from '@/components/MusicProjects/MusicStatBadge';
import { MusicListTable } from './MusicListTable';

type AlbumListViewProps = {
  albums: AlbumListItem[];
  locale: string;
};

export function AlbumListView({ albums, locale }: AlbumListViewProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();

  return (
    <MusicListTable
      rows={albums.map(album => ({
        id: album.id,
        coverImageUrl: album.coverImageUrl,
        coverType: 'album' as const,
        title: album.name,
        subtitle: `Album • ${album.projectName}`,
        statPrimary: (
          <MusicStatBadge
            count={album.songCount}
            label={t('songs_stat_label')}
            compact
          />
        ),
        trailing: format(new Date(album.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/albums/${album.id}`),
      }))}
    />
  );
}
