'use client';

import {
  Box,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListContentSkeleton } from '@/components/MusicProjects/MusicListContentSkeleton';
import { MusicListEmptyState } from '@/components/MusicProjects/MusicListEmptyState';
import { MusicListPageHeader } from '@/components/MusicProjects/MusicListPageHeader';
import { MusicListToolbar } from '@/components/MusicProjects/MusicListToolbar';
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { SongCard } from '@/components/MusicProjects/SongCard';
import { SongListView } from '@/components/MusicProjects/Views/SongListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useSongs } from '@/queries/hooks/songs';
import { filterByProjectIds, filterBySearchQuery } from '@/utils/filterMusicListItems';

type SongsClientProps = {
  locale: string;
};

export function SongsClient({ locale }: SongsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: songs, isLoading, error } = useSongs(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const filteredSongs = useMemo(() => {
    const byProject = filterByProjectIds(
      songs ?? [],
      selectedProjectIds,
      song => song.musicProjectId,
    );
    return filterBySearchQuery(
      byProject,
      searchQuery,
      s => [s.title, s.projectName, s.albumName].filter(Boolean).join(' '),
    );
  }, [songs, searchQuery, selectedProjectIds]);

  if (error) {
    return (
      <Typography color="error">
        {t('load_error')}
      </Typography>
    );
  }

  const isEmpty = !songs?.length;
  const newSongButton = <NewSongButton locale={locale} variant="toolbar" />;

  return (
    <Box>
      <MusicListPageHeader
        title={t('songs_page_title')}
        heroImageSrc="/assets/images/songs-hero.png"
        toolbar={!isLoading
          ? isEmpty
            ? newSongButton
            : (
                <MusicListToolbar
                  showViewControls
                  viewMode={viewMode}
                  cardSize={cardSize}
                  onViewModeChange={setViewMode}
                  onCardSizeChange={setCardSize}
                  locale={locale}
                  selectedProjectIds={selectedProjectIds}
                  onSelectedProjectIdsChange={setSelectedProjectIds}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search songs"
                  newButton={newSongButton}
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
                kind="song"
                title={t('songs_empty_title')}
                description={t('songs_empty_description')}
              />
            )
          : filteredSongs.length === 0 && (searchQuery || selectedProjectIds.length > 0)
            ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : t('no_results_filter_songs')}
                </Typography>
              )
            : viewMode === 'list'
              ? (
                  <SongListView songs={filteredSongs} locale={locale} />
                )
              : (
                  <MusicFolderGrid
                    cardSize={cardSize}
                    items={filteredSongs.map(song => ({
                      id: song.id,
                      content: (
                        <SongCard
                          song={song}
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
