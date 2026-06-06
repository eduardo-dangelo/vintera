'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { SongListItem } from '@/queries/hooks/songs';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { ListViewControls } from '@/components/common/ListViewControls';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useSongs } from '@/queries/hooks/songs';
import { MusicFolderGrid } from './MusicFolderGrid';
import { SongCard } from './SongCard';
import { SongListView } from './Views/SongListView';

type ProjectDetailSongsSectionProps = {
  locale: string;
  projectId: number;
  project: Pick<MusicProjectDetail['project'], 'name' | 'color' | 'coverImageUrl'>;
  songs: MusicProjectDetail['songs'];
  albums: MusicProjectDetail['albums'];
};

function toFallbackSongListItem(
  song: MusicProjectDetail['songs'][number],
  projectId: number,
  project: ProjectDetailSongsSectionProps['project'],
  albums: MusicProjectDetail['albums'],
): SongListItem {
  const album = albums.find(a => a.id === song.albumId);
  return {
    id: song.id,
    title: song.title,
    musicProjectId: projectId,
    albumId: song.albumId,
    updatedAt: new Date(song.updatedAt),
    projectName: project.name,
    projectColor: project.color,
    albumName: album?.name ?? null,
    coverImageUrl: album?.coverImageUrl ?? project.coverImageUrl,
    authors: [],
  };
}

export function ProjectDetailSongsSection({
  locale,
  projectId,
  project,
  songs,
  albums,
}: ProjectDetailSongsSectionProps) {
  const t = useTranslations('MusicProjects');
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);
  const { data: allSongs } = useSongs(locale);

  const songListItems = useMemo(() => {
    const songsById = new Map(allSongs?.map(s => [s.id, s]) ?? []);
    return songs.map((song) => {
      return songsById.get(song.id)
        ?? toFallbackSongListItem(song, projectId, project, albums);
    });
  }, [songs, allSongs, projectId, project, albums]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('songs')}
        </Typography>
        {songs.length > 0 && (
          <ListViewControls
            viewMode={viewMode}
            cardSize={cardSize}
            onViewModeChange={setViewMode}
            onCardSizeChange={setCardSize}
          />
        )}
      </Box>
      {songs.length === 0
        ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t('no_songs')}
            </Typography>
          )
        : viewMode === 'list'
          ? (
              <SongListView
                songs={songListItems}
                locale={locale}
                projectId={projectId}
              />
            )
          : (
              <MusicFolderGrid
                cardSize={cardSize}
                items={songListItems.map(song => ({
                  id: song.id,
                  content: (
                    <SongCard
                      song={song}
                      locale={locale}
                      cardSize={cardSize}
                      projectId={projectId}
                    />
                  ),
                }))}
              />
            )}
    </Box>
  );
}
