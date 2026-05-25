'use client';

import { Album as AlbumIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { NewAlbumButton } from '@/components/MusicProjects/NewAlbumButton';
import { useAlbums } from '@/queries/hooks/albums';

type AlbumsClientProps = {
  locale: string;
};

export function AlbumsClient({ locale }: AlbumsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: albums, isLoading, error } = useAlbums(locale);

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
        <NewAlbumButton locale={locale} />
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
        : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {albums.map(album => (
                <ListItemButton
                  key={album.id}
                  component={Link}
                  href={`/${locale}/albums/${album.id}`}
                  divider
                >
                  <ListItemText
                    primary={album.name}
                    secondary={`${album.projectName}${album.status ? ` · ${album.status}` : ''}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
    </Box>
  );
}
