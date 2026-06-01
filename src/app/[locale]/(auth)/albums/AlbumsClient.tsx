'use client';

import {
  Box,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { AlbumCard } from '@/components/MusicProjects/AlbumCard';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListContentSkeleton } from '@/components/MusicProjects/MusicListContentSkeleton';
import { MusicListEmptyState } from '@/components/MusicProjects/MusicListEmptyState';
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
      a => [a.name, a.projectName].filter(Boolean).join(' '),
    ),
    [albums, searchQuery],
  );

  if (error) {
    return (
      <Typography color="error">
        {t('load_error')}
      </Typography>
    );
  }

  const isEmpty = !albums?.length;
  const newAlbumButton = <NewAlbumButton locale={locale} variant="toolbar" />;

  return (
    <Box>
      <MusicListPageHeader
        title={t('albums_page_title')}
        heroImageSrc="/assets/images/albums-hero.png"
        toolbar={!isLoading
          ? isEmpty
            ? newAlbumButton
            : (
                <MusicListToolbar
                  showViewControls
                  viewMode={viewMode}
                  cardSize={cardSize}
                  onViewModeChange={setViewMode}
                  onCardSizeChange={setCardSize}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search albums"
                  newButton={newAlbumButton}
                />
              )
          : undefined}
      />

      {isLoading
        ? (
            <MusicListContentSkeleton viewMode={viewMode} cardSize={cardSize} />
          )
        : isEmpty
          ? (
              <MusicListEmptyState
                kind="album"
                title={t('albums_empty_title')}
                description={t('albums_empty_description')}
              />
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
