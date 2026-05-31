'use client';

import { QueueMusic as SongIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListPageHeader } from '@/components/MusicProjects/MusicListPageHeader';
import { MusicListToolbar } from '@/components/MusicProjects/MusicListToolbar';
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { SongCard } from '@/components/MusicProjects/SongCard';
import { SongListView } from '@/components/MusicProjects/Views/SongListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useSongs } from '@/queries/hooks/songs';
import { filterBySearchQuery } from '@/utils/filterMusicListItems';

type SongsClientProps = {
  locale: string;
};

export function SongsClient({ locale }: SongsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: songs, isLoading, error } = useSongs(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const filteredSongs = useMemo(
    () => filterBySearchQuery(
      songs ?? [],
      searchQuery,
      s => [s.title, s.projectName, s.albumName, s.status].filter(Boolean).join(' '),
    ),
    [songs, searchQuery],
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

  const isEmpty = !songs?.length;

  return (
    <Box>
      <MusicListPageHeader
        title={t('songs_page_title')}
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
                searchPlaceholder="Search songs"
                newButton={<NewSongButton locale={locale} variant="toolbar" />}
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
              <SongIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('songs_empty_title')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {t('songs_empty_description')}
              </Typography>
              <NewSongButton locale={locale} variant="listItem" />
            </Box>
          )
        : filteredSongs.length === 0 && searchQuery
          ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {`No results for "${searchQuery}"`}
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
