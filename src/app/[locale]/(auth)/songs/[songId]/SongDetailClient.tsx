'use client';

import { ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDeleteSongById } from '@/queries/hooks/songs/useDeleteSongById';
import { useSong } from '@/queries/hooks/songs/useSong';
import { useUpdateSongById } from '@/queries/hooks/songs/useUpdateSongById';

type SongDetailClientProps = {
  locale: string;
  songId: number;
  breadcrumbProjectId?: number;
};

export function SongDetailClient({ locale, songId, breadcrumbProjectId }: SongDetailClientProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const { data, isLoading, error } = useSong(locale, songId);
  const updateSong = useUpdateSongById(locale);
  const deleteSong = useDeleteSongById(locale);
  const [editLyrics, setEditLyrics] = useState('');
  const [editChords, setEditChords] = useState('');

  useEffect(() => {
    if (data?.song) {
      setEditLyrics(data.song.lyrics || '');
      setEditChords(data.song.chordsOrTabs || '');
    }
  }, [data?.song]);

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
        {t('song_not_found')}
      </Typography>
    );
  }

  const { song, project } = data;
  const accent = project.color || '#7c3aed';
  const projectHref = `/${locale}/projects/${project.id}`;
  const songsListHref = `/${locale}/songs`;

  const statusLabel = (status: string) => {
    const key = `status_${status}` as 'status_idea' | 'status_demo' | 'status_recording' | 'status_released';
    return t(key);
  };

  const handleSave = async () => {
    await updateSong.mutateAsync({
      songId,
      data: { lyrics: editLyrics, chordsOrTabs: editChords },
    });
  };

  const handleDelete = async () => {
    await deleteSong.mutateAsync({ songId });
    router.push(songsListHref);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link href={`/${locale}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {t('breadcrumb_projects')}
        </Link>
        {(breadcrumbProjectId ?? project.id) && (
          <Link href={projectHref} style={{ textDecoration: 'none', color: 'inherit' }}>
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">{song.title}</Typography>
      </Breadcrumbs>

      <Button
        component={Link}
        href={breadcrumbProjectId ? projectHref : songsListHref}
        startIcon={<ArrowBack />}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        {breadcrumbProjectId ? project.name : t('back_to_songs')}
      </Button>

      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)`,
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {song.trackNumber ? `${song.trackNumber}. ` : ''}
          {song.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={project.name}
            size="small"
            component={Link}
            href={projectHref}
            clickable
            sx={{ bgcolor: `${accent}33`, color: accent }}
          />
          <Chip label={statusLabel(song.status)} size="small" />
        </Box>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={6}
        label={t('lyrics')}
        value={editLyrics}
        onChange={e => setEditLyrics(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        multiline
        rows={4}
        label={t('chords_tabs')}
        value={editChords}
        onChange={e => setEditChords(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={updateSong.isPending}
        >
          {t('save')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => void handleDelete()}
          disabled={deleteSong.isPending}
        >
          {t('delete')}
        </Button>
      </Box>
    </Box>
  );
}
