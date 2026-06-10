'use client';

import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MusicEntityDetailPageSkeleton } from '@/components/MusicProjects/MusicEntityDetailPageSkeleton';
import { SongDetailPageHeader } from '@/components/MusicProjects/SongDetailPageHeader';
import { useDeleteSongById } from '@/queries/hooks/songs/useDeleteSongById';
import { useSong } from '@/queries/hooks/songs/useSong';
import { useUpdateSongById } from '@/queries/hooks/songs/useUpdateSongById';

type SongDetailClientProps = {
  locale: string;
  songId: number;
  breadcrumbProjectId?: number;
};

export function SongDetailClient({ locale, songId }: SongDetailClientProps) {
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
    return <MusicEntityDetailPageSkeleton bodyVariant="song" />;
  }

  if (error || !data) {
    return (
      <Typography color="error">
        {t('song_not_found')}
      </Typography>
    );
  }

  const { song, project, album } = data;
  const songsListHref = `/${locale}/songs`;

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
      <SongDetailPageHeader
        locale={locale}
        songId={songId}
        song={song}
        project={project}
        album={album}
      />

      <Box sx={{ mt: 0 }}>
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
    </Box>
  );
}
