'use client';

import type { ProjectTabProject } from './projectSongUtils';
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

type OverviewAlbumsPreviewProps = {
  locale: string;
  project: ProjectTabProject;
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  /** When true, parent chrome owns the title / View all. */
  hideChrome?: boolean;
  onViewAll?: () => void;
};

export function OverviewAlbumsPreview({
  locale,
  project,
  albums,
  songs,
  hideChrome = false,
  onViewAll,
}: OverviewAlbumsPreviewProps) {
  const t = useTranslations('MusicProjects');
  const albumsHaveTab = hasAlbumsTab(albums.length);

  const albumListItems = useMemo(() => {
    const sorted = sortByRecent(albums, album => album.updatedAt);
    const items = albumsHaveTab
      ? takeRecent(sorted, OVERVIEW_PREVIEW_LIMIT)
      : sorted;
    return items.map(album => toAlbumListItem(album, project, songs));
  }, [albums, project, songs, albumsHaveTab]);

  if (albums.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {t('no_albums')}
      </Typography>
    );
  }

  const title = albumsHaveTab ? t('overview_recent_albums') : t('albums');

  return (
    <Box sx={{ width: '100%' }}>
      {!hideChrome && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {albumsHaveTab && onViewAll && (
            <Button
              size="small"
              onClick={onViewAll}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              {t('overview_view_all')}
            </Button>
          )}
        </Box>
      )}
      <AlbumListView albums={albumListItems} locale={locale} />
    </Box>
  );
}

type OverviewSongsPreviewProps = {
  locale: string;
  projectId: number;
  project: ProjectTabProject;
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  hideChrome?: boolean;
  onViewAll?: () => void;
};

export function OverviewSongsPreview({
  locale,
  projectId,
  project,
  albums,
  songs,
  hideChrome = false,
  onViewAll,
}: OverviewSongsPreviewProps) {
  const t = useTranslations('MusicProjects');
  const { data: allSongs } = useSongs(locale);
  const songsHaveTab = hasSongsTab(songs.length);

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

  if (songs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {t('no_songs')}
      </Typography>
    );
  }

  const title = songsHaveTab ? t('overview_recent_songs') : t('songs');

  return (
    <Box sx={{ width: '100%' }}>
      {!hideChrome && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {songsHaveTab && onViewAll && (
            <Button
              size="small"
              onClick={onViewAll}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              {t('overview_view_all')}
            </Button>
          )}
        </Box>
      )}
      <SongListView
        songs={songListItems}
        locale={locale}
        projectId={projectId}
      />
    </Box>
  );
}
