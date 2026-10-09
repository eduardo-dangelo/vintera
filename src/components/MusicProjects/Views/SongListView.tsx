'use client';

import type { SongListItem } from '@/queries/hooks/songs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MusicPeopleAvatarGroup } from '@/components/MusicProjects/MusicPeopleAvatarGroup';
import { getSongDetailHref } from '@/utils/musicRoutes';
import { MusicListTable } from './MusicListTable';

type SongListViewProps = {
  songs: SongListItem[];
  locale: string;
  projectId?: number;
  hideItemActions?: boolean;
};

export function SongListView({ songs, locale, projectId, hideItemActions = false }: SongListViewProps) {
  const router = useRouter();

  return (
    <MusicListTable
      locale={locale}
      rows={songs.map((song) => {
        const href = getSongDetailHref(locale, song.id, projectId);
        return {
          id: song.id,
          coverImageUrl: song.coverImageUrl,
          coverType: 'song' as const,
          title: song.title,
          subtitle: `Song • ${song.albumName ?? song.projectName}`,
          menuTarget: hideItemActions
            ? undefined
            : {
                kind: 'song' as const,
                id: song.id,
                href,
                name: song.title,
              },
          meta: <MusicPeopleAvatarGroup people={song.authors} size={22} />,
          trailing: format(new Date(song.updatedAt), 'MMM d, yyyy'),
          onClick: () => router.push(href),
        };
      })}
    />
  );
}
