'use client';

import { QueueMusic as SongIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ListViewControls } from '@/components/common/ListViewControls';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { SongCard } from '@/components/MusicProjects/SongCard';
import { SongListView } from '@/components/MusicProjects/Views/SongListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useSongs } from '@/queries/hooks/songs';

type SongsClientProps = {
  locale: string;
};

export function SongsClient({ locale }: SongsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: songs, isLoading, error } = useSongs(locale);
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t('songs_page_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('songs_page_description')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {!isEmpty && (
            <ListViewControls
              viewMode={viewMode}
              cardSize={cardSize}
              onViewModeChange={setViewMode}
              onCardSizeChange={setCardSize}
            />
          )}
          <NewSongButton locale={locale} />
        </Box>
      </Box>

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
        : viewMode === 'list'
          ? (
              <SongListView songs={songs} locale={locale} />
            )
          : (
              <MusicFolderGrid cardSize={cardSize}>
                {songs.map(song => (
                  <SongCard
                    key={song.id}
                    song={song}
                    locale={locale}
                    cardSize={cardSize}
                  />
                ))}
              </MusicFolderGrid>
            )}
    </Box>
  );
}
