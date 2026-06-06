'use client';

import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { NewAlbumButton } from '@/components/MusicProjects/NewAlbumButton';
import { NewSongButton } from '@/components/MusicProjects/NewSongButton';
import { ProjectDetailPageHeader } from '@/components/MusicProjects/ProjectDetailPageHeader';
import { ProjectDetailSidebar } from '@/components/MusicProjects/ProjectDetailSidebar';
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
  const deleteSong = useDeleteSong(locale);

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

  const { project, albums, songs, members } = data;
  const accent = project.color || '#7c3aed';

  return (
    <Box>
      <ProjectDetailPageHeader
        locale={locale}
        projectId={projectId}
        name={project.name}
        coverImageUrl={project.coverImageUrl}
        titleColor={project.color}
        metadata={project.metadata}
        albumCount={albums.length}
        songCount={songs.length}
        memberCount={members.length}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProjectDetailSidebar
            locale={locale}
            projectId={projectId}
            genre={project.genre}
            description={project.description}
            accent={accent}
          />
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

    </Box>
  );
}
