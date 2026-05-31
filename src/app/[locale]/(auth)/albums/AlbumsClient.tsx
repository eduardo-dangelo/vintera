'use client';

import { Album as AlbumIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { AlbumCard } from '@/components/MusicProjects/AlbumCard';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListPageHeader } from '@/components/MusicProjects/MusicListPageHeader';
import { MusicListToolbar } from '@/components/MusicProjects/MusicListToolbar';
import { NewAlbumButton } from '@/components/MusicProjects/NewAlbumButton';
import { AlbumListView } from '@/components/MusicProjects/Views/AlbumListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useAlbums } from '@/queries/hooks/albums';
import { filterBySearchQuery } from '@/utils/filterMusicListItems';

type AlbumsClientProps = {
  locale: string;
};

export function AlbumsClient({ locale }: AlbumsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: albums, isLoading, error } = useAlbums(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const filteredAlbums = useMemo(
    () => filterBySearchQuery(
      albums ?? [],
      searchQuery,
      a => [a.name, a.projectName, a.status].filter(Boolean).join(' '),
    ),
    [albums, searchQuery],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {t('load_error')}
      </Typography>
    );
  }

  const isEmpty = !albums?.length;

  return (
    <Box>
      <MusicListPageHeader
        title={t('albums_page_title')}
        toolbar={!isEmpty
          ? (
              <MusicListToolbar
                showViewControls
                viewMode={viewMode}
                cardSize={cardSize}
                onViewModeChange={setViewMode}
                onCardSizeChange={setCardSize}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search albums"
                newButton={<NewAlbumButton locale={locale} variant="toolbar" />}
              />
            )
          : undefined}
      />

      {isEmpty
        ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                px: 3,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <AlbumIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('albums_empty_title')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {t('albums_empty_description')}
              </Typography>
              <NewAlbumButton locale={locale} variant="listItem" />
            </Box>
          )
        : filteredAlbums.length === 0 && searchQuery
          ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {`No results for "${searchQuery}"`}
              </Typography>
            )
          : viewMode === 'list'
            ? (
                <AlbumListView albums={filteredAlbums} locale={locale} />
              )
            : (
                <MusicFolderGrid
                  cardSize={cardSize}
                  items={filteredAlbums.map(album => ({
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
