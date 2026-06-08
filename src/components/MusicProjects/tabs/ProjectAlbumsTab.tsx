'use client';

import type { ProjectTabProject } from './projectSongUtils';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { ListViewControls } from '@/components/common/ListViewControls';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { AlbumCard } from '../AlbumCard';
import { MusicFolderGrid } from '../MusicFolderGrid';
import { NewAlbumButton } from '../NewAlbumButton';
import { AlbumListView } from '../Views/AlbumListView';
import { toAlbumListItem } from './projectAlbumUtils';

type ProjectAlbumsTabProps = {
  locale: string;
  projectId: number;
  project: ProjectTabProject;
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
};

export function ProjectAlbumsTab({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
}: ProjectAlbumsTabProps) {
  const t = useTranslations('MusicProjects');
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const albumListItems = useMemo(
    () => albums.map(album => toAlbumListItem(album, project, songs)),
    [albums, project, songs],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('albums')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {albums.length > 0 && (
            <ListViewControls
              viewMode={viewMode}
              cardSize={cardSize}
              onViewModeChange={setViewMode}
              onCardSizeChange={setCardSize}
            />
          )}
          {canEdit && <NewAlbumButton locale={locale} projectId={projectId} />}
        </Box>
      </Box>
      {albums.length === 0
        ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {t('no_albums')}
            </Typography>
          )
        : viewMode === 'list'
          ? (
              <AlbumListView albums={albumListItems} locale={locale} />
            )
          : (
              <MusicFolderGrid
                cardSize={cardSize}
                items={albumListItems.map(album => ({
                  id: album.id,
                  content: (
                    <AlbumCard
                      album={album}
                      locale={locale}
                      cardSize={cardSize}
                    />
                  ),
                }))}
              />
            )}
    </Box>
  );
}
