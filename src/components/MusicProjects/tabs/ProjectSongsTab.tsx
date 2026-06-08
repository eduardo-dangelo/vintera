'use client';

import type { ProjectTabProject } from './projectSongUtils';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { ListViewControls } from '@/components/common/ListViewControls';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useSongs } from '@/queries/hooks/songs';
import { MusicFolderGrid } from '../MusicFolderGrid';
import { SongCard } from '../SongCard';
import { SongListView } from '../Views/SongListView';
import { toFallbackSongListItem } from './projectSongUtils';

type ProjectSongsTabProps = {
  locale: string;
  projectId: number;
  project: ProjectTabProject;
  songs: MusicProjectDetail['songs'];
  albums: MusicProjectDetail['albums'];
};

export function ProjectSongsTab({
  locale,
  projectId,
  project,
  songs,
  albums,
}: ProjectSongsTabProps) {
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

  if (songs.length === 0) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('songs')}
        </Typography>
        <ListViewControls
          viewMode={viewMode}
          cardSize={cardSize}
          onViewModeChange={setViewMode}
          onCardSizeChange={setCardSize}
        />
      </Box>
      {viewMode === 'list'
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
