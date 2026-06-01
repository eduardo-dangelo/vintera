'use client';

import type { SongListItem } from '@/queries/hooks/songs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MusicPeopleAvatarGroup } from '@/components/MusicProjects/MusicPeopleAvatarGroup';
import { MusicListTable } from './MusicListTable';

type SongListViewProps = {
  songs: SongListItem[];
  locale: string;
};

export function SongListView({ songs, locale }: SongListViewProps) {
  const router = useRouter();

  return (
    <MusicListTable
      rows={songs.map(song => ({
        id: song.id,
        coverImageUrl: song.coverImageUrl,
        coverType: 'song' as const,
        title: song.title,
        subtitle: `Song • ${song.albumName ?? song.projectName}`,
        meta: <MusicPeopleAvatarGroup people={song.authors} size={22} />,
        trailing: format(new Date(song.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/songs/${song.id}`),
      }))}
    />
  );
}
