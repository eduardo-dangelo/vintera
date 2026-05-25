'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCreateSong } from '@/queries/hooks/music-projects/useCreateSong';
import { useMusicProject } from '@/queries/hooks/music-projects/useMusicProject';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';

type CreateSongDialogProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  projectId?: number;
  onCreated?: (songId: number) => void;
};

export function CreateSongDialog({
  open,
  onClose,
  locale,
  projectId: presetProjectId,
  onCreated,
}: CreateSongDialogProps) {
  const t = useTranslations('MusicProjects');
  const createSong = useCreateSong(locale);
  const { data: projects } = useMusicProjects(locale);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = presetProjectId ?? (selectedProjectId === '' ? undefined : selectedProjectId);
  const { data: projectData } = useMusicProject(locale, effectiveProjectId ?? 0);
  const albums = effectiveProjectId ? (projectData?.albums ?? []) : [];
  const hasProjects = (projects?.length ?? 0) > 0;

  useEffect(() => {
    if (open) {
      if (presetProjectId) {
        setSelectedProjectId(presetProjectId);
      }
      titleInputRef.current?.focus();
    }
  }, [open, presetProjectId]);

  const handleClose = () => {
    setTitle('');
    setAlbumId('');
    if (!presetProjectId) {
      setSelectedProjectId('');
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!effectiveProjectId || !title.trim()) {
      return;
    }
    const song = await createSong.mutateAsync({
      projectId: effectiveProjectId,
      title: title.trim(),
      albumId: albumId === '' ? null : albumId,
    });
    handleClose();
    onCreated?.(song.id);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('create_song')}</DialogTitle>
      <DialogContent>
        {!hasProjects
          ? (
              <TextField
                fullWidth
                disabled
                helperText={t('create_project_first')}
                sx={{ mt: 1 }}
              />
            )
          : (
              <>
                {!presetProjectId && (
                  <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                    <InputLabel>{t('select_project')}</InputLabel>
                    <Select
                      value={selectedProjectId}
                      label={t('select_project')}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value as number);
                        setAlbumId('');
                      }}
                    >
                      {projects?.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  inputRef={titleInputRef}
                  fullWidth
                  label={t('song_title')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  disabled={!effectiveProjectId}
                />
                {effectiveProjectId && albums.length > 0 && (
                  <FormControl fullWidth>
                    <InputLabel>{t('select_album')}</InputLabel>
                    <Select
                      value={albumId}
                      label={t('select_album')}
                      onChange={e => setAlbumId(e.target.value as number | '')}
                    >
                      <MenuItem value="">{t('single')}</MenuItem>
                      {albums.map(album => (
                        <MenuItem key={album.id} value={album.id}>
                          {album.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!hasProjects && (
          <Button component={Link} href={`/${locale}/projects`} sx={{ mr: 'auto' }}>
            {t('view_projects')}
          </Button>
        )}
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!hasProjects || !effectiveProjectId || !title.trim() || createSong.isPending}
        >
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
