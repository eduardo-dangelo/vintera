'use client';

import {
  ArrowBack,
  Delete as DeleteIcon,
  MoreVert,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NewAlbumButton } from '@/components/MusicProjects/NewAlbumButton';
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
import { useDeleteSong } from '@/queries/hooks/music-projects/useDeleteSong';
import { useMusicProject } from '@/queries/hooks/music-projects/useMusicProject';

type ProjectDetailClientProps = {
  locale: string;
  projectId: number;
};

export function ProjectDetailClient({ locale, projectId }: ProjectDetailClientProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useMusicProject(locale, projectId);
  const deleteProject = useDeleteMusicProject(locale);
  const deleteSong = useDeleteSong(locale);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const songParam = searchParams.get('song');
    const albumParam = searchParams.get('album');

    if (songParam) {
      const songId = Number.parseInt(songParam, 10);
      if (!Number.isNaN(songId)) {
        router.replace(`/${locale}/songs/${songId}`);
      }
      return;
    }

    if (albumParam) {
      const albumId = Number.parseInt(albumParam, 10);
      if (!Number.isNaN(albumId)) {
        router.replace(`/${locale}/albums/${albumId}`);
      }
    }
  }, [searchParams, locale, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography color="error">
        Project not found
      </Typography>
    );
  }

  const { project, albums, songs } = data;
  const accent = project.color || '#7c3aed';

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync(projectId);
    setDeleteDialogOpen(false);
    router.push(`/${locale}/projects`);
  };

  const statusLabel = (status: string) => {
    const key = `status_${status}` as 'status_idea' | 'status_demo' | 'status_recording' | 'status_released' | 'status_draft';
    return t(key);
  };

  return (
    <Box>
      <Button
        component={Link}
        href={`/${locale}/projects`}
        startIcon={<ArrowBack />}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        {t('back_to_projects')}
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              position: { md: 'sticky' },
              top: 24,
              p: 3,
              borderRadius: 4,
              background: `linear-gradient(160deg, ${accent}33 0%, transparent 60%)`,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    setDeleteDialogOpen(true);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('delete')}
                </MenuItem>
              </Menu>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {project.name}
            </Typography>
            {project.genre && (
              <Chip label={project.genre} size="small" sx={{ mb: 2, bgcolor: `${accent}33`, color: accent }} />
            )}
            {project.description && (
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {project.description}
              </Typography>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t('album_count', { count: albums.length })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('song_count', { count: songs.length })}
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('albums')}
              </Typography>
              <NewAlbumButton locale={locale} projectId={projectId} />
            </Box>
            {albums.length === 0
              ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {t('no_albums')}
                  </Typography>
                )
              : (
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                    {albums.map(album => (
                      <Box
                        key={album.id}
                        component={Link}
                        href={`/${locale}/projects/${projectId}/albums/${album.id}`}
                        sx={{
                          'minWidth': 160,
                          'p': 2,
                          'borderRadius': 2,
                          'border': '1px solid',
                          'borderColor': 'divider',
                          'bgcolor': 'background.paper',
                          'textDecoration': 'none',
                          'color': 'inherit',
                          'transition': 'border-color 0.2s ease',
                          '&:hover': {
                            borderColor: accent,
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {album.name}
                        </Typography>
                        <Chip
                          label={statusLabel(album.status)}
                          size="small"
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('songs')}
              </Typography>
              <NewSongButton locale={locale} projectId={projectId} />
            </Box>
            {songs.length === 0
              ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    {t('no_songs')}
                  </Typography>
                )
              : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {songs.map((song) => {
                      const album = albums.find(a => a.id === song.albumId);
                      return (
                        <Box
                          key={song.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            component={Link}
                            href={`/${locale}/projects/${projectId}/songs/${song.id}`}
                            sx={{
                              'fontWeight': 600,
                              'flex': 1,
                              'textDecoration': 'none',
                              'color': 'inherit',
                              '&:hover': { color: accent },
                            }}
                          >
                            {song.trackNumber ? `${song.trackNumber}. ` : ''}
                            {song.title}
                          </Typography>
                          {album && (
                            <Typography
                              component={Link}
                              href={`/${locale}/projects/${projectId}/albums/${album.id}`}
                              variant="caption"
                              color="text.secondary"
                              sx={{ 'textDecoration': 'none', '&:hover': { color: accent } }}
                            >
                              {album.name}
                            </Typography>
                          )}
                          <Chip label={statusLabel(song.status)} size="small" />
                          <IconButton
                            size="small"
                            onClick={() => deleteSong.mutate({ projectId, songId: song.id })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                )}
          </Box>
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('delete_confirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteProject()}
            disabled={deleteProject.isPending}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
