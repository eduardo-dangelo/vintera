'use client';

import type { SongListItem } from '@/queries/hooks/songs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MusicListTable } from './MusicListTable';

type SongListViewProps = {
  songs: SongListItem[];
  locale: string;
};

function buildSongSubtitle(song: SongListItem) {
  const context = song.albumName ?? song.projectName;
  let subtitle = `Song • ${context}`;
  if (song.status) {
    subtitle += ` · ${song.status}`;
  }
  return subtitle;
}

export function SongListView({ songs, locale }: SongListViewProps) {
  const router = useRouter();

  return (
    <MusicListTable
      rows={songs.map(song => ({
        id: song.id,
        coverImageUrl: song.coverImageUrl,
        coverType: 'song' as const,
        title: song.title,
        subtitle: buildSongSubtitle(song),
        trailing: format(new Date(song.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/songs/${song.id}`),
      }))}
    />
  );
}
