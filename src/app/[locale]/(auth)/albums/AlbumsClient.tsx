'use client';

import { Album as AlbumIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { ListViewControls } from '@/components/common/ListViewControls';
import { AlbumCard } from '@/components/MusicProjects/AlbumCard';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { NewAlbumButton } from '@/components/MusicProjects/NewAlbumButton';
import { AlbumListView } from '@/components/MusicProjects/Views/AlbumListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useAlbums } from '@/queries/hooks/albums';

type AlbumsClientProps = {
  locale: string;
};

export function AlbumsClient({ locale }: AlbumsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: albums, isLoading, error } = useAlbums(locale);
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

  const isEmpty = !albums?.length;

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
            {t('albums_page_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('albums_page_description')}
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
          <NewAlbumButton locale={locale} />
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
        : viewMode === 'list'
          ? (
              <AlbumListView albums={albums} locale={locale} />
            )
          : (
              <MusicFolderGrid cardSize={cardSize}>
                {albums.map(album => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    locale={locale}
                    cardSize={cardSize}
                  />
                ))}
              </MusicFolderGrid>
            )}
    </Box>
  );
}
