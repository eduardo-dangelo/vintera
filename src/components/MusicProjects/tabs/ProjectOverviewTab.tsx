'use client';

import type { ReactNode } from 'react';
import type { ProjectTabProject } from './projectSongUtils';
import type { ProjectTabName } from './projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { Box, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useSongs } from '@/queries/hooks/songs';
import { AlbumListView } from '../Views/AlbumListView';
import { SongListView } from '../Views/SongListView';
import { toAlbumListItem } from './projectAlbumUtils';
import { toFallbackSongListItem } from './projectSongUtils';
import {
  hasAlbumsTab,
  hasSongsTab,
  OVERVIEW_PREVIEW_LIMIT,

} from './projectTabVisibility';
import { sortByRecent, takeRecent } from './recentItems';

export type { ProjectTabName } from './projectTabVisibility';

type ProjectOverviewTabProps = {
  locale: string;
  projectId: number;
  project: ProjectTabProject;
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  onNavigateToTab: (tab: ProjectTabName) => void;
};

type OverviewSectionProps = {
  title: string;
  totalCount: number;
  showViewAll: boolean;
  onNavigate: () => void;
  viewAllLabel: string;
  children: ReactNode;
};

function OverviewSection({
  title,
  totalCount,
  showViewAll,
  onNavigate,
  viewAllLabel,
  children,
}: OverviewSectionProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {showViewAll && (
          <Button
            size="small"
            onClick={onNavigate}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            {viewAllLabel}
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
}

export function ProjectOverviewTab({
  locale,
  projectId,
  project,
  albums,
  songs,
  onNavigateToTab,
}: ProjectOverviewTabProps) {
  const t = useTranslations('MusicProjects');
  const { data: allSongs } = useSongs(locale);

  const albumsHaveTab = hasAlbumsTab(albums.length);
  const songsHaveTab = hasSongsTab(songs.length);

  const albumListItems = useMemo(() => {
    const sorted = sortByRecent(albums, album => album.updatedAt);
    const items = albumsHaveTab
      ? takeRecent(sorted, OVERVIEW_PREVIEW_LIMIT)
      : sorted;
    return items.map(album => toAlbumListItem(album, project, songs));
  }, [albums, project, songs, albumsHaveTab]);

  const songListItems = useMemo(() => {
    const songsById = new Map(allSongs?.map(s => [s.id, s]) ?? []);
    const sorted = sortByRecent(songs, song => song.updatedAt);
    const items = songsHaveTab
      ? takeRecent(sorted, OVERVIEW_PREVIEW_LIMIT)
      : sorted;
    return items.map((song) => {
      return songsById.get(song.id)
        ?? toFallbackSongListItem(song, projectId, project, albums);
    });
  }, [songs, allSongs, projectId, project, albums, songsHaveTab]);

  if (albums.length === 0 && songs.length === 0) {
    return null;
  }

  return (
    <Box>
      <OverviewSection
        title={albumsHaveTab ? t('overview_recent_albums') : t('albums')}
        totalCount={albums.length}
        showViewAll={albumsHaveTab}
        onNavigate={() => onNavigateToTab('albums')}
        viewAllLabel={t('overview_view_all')}
      >
        <AlbumListView albums={albumListItems} locale={locale} />
      </OverviewSection>

      <OverviewSection
        title={songsHaveTab ? t('overview_recent_songs') : t('songs')}
        totalCount={songs.length}
        showViewAll={songsHaveTab}
        onNavigate={() => onNavigateToTab('songs')}
        viewAllLabel={t('overview_view_all')}
      >
        <SongListView
          songs={songListItems}
          locale={locale}
          projectId={projectId}
        />
      </OverviewSection>
    </Box>
  );
}
