'use client';

import { QueueMusic as SongIcon } from '@mui/icons-material';
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
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { useSongs } from '@/queries/hooks/songs';

type SongsClientProps = {
  locale: string;
};

export function SongsClient({ locale }: SongsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: songs, isLoading, error } = useSongs(locale);

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
        <NewSongButton locale={locale} />
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
        : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {songs.map(song => (
                <ListItemButton
                  key={song.id}
                  component={Link}
                  href={`/${locale}/songs/${song.id}`}
                  divider
                >
                  <ListItemText
                    primary={song.title}
                    secondary={`${song.projectName}${song.status ? ` · ${song.status}` : ''}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
    </Box>
  );
}
