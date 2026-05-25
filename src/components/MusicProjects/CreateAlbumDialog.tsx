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
import { useCreateAlbum } from '@/queries/hooks/music-projects/useCreateAlbum';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';

type CreateAlbumDialogProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  projectId?: number;
  onCreated?: (albumId: number) => void;
};

export function CreateAlbumDialog({
  open,
  onClose,
  locale,
  projectId: presetProjectId,
  onCreated,
}: CreateAlbumDialogProps) {
  const t = useTranslations('MusicProjects');
  const createAlbum = useCreateAlbum(locale);
  const { data: projects } = useMusicProjects(locale);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = presetProjectId ?? (selectedProjectId === '' ? undefined : selectedProjectId);
  const hasProjects = (projects?.length ?? 0) > 0;

  useEffect(() => {
    if (open) {
      if (presetProjectId) {
        setSelectedProjectId(presetProjectId);
      }
      nameInputRef.current?.focus();
    }
  }, [open, presetProjectId]);

  const handleClose = () => {
    setName('');
    if (!presetProjectId) {
      setSelectedProjectId('');
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!effectiveProjectId || !name.trim()) {
      return;
    }
    const album = await createAlbum.mutateAsync({
      projectId: effectiveProjectId,
      name: name.trim(),
    });
    handleClose();
    onCreated?.(album.id);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('create_album')}</DialogTitle>
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
                      onChange={e => setSelectedProjectId(e.target.value as number)}
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
                  inputRef={nameInputRef}
                  fullWidth
                  label={t('album_name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  disabled={!effectiveProjectId}
                />
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
          disabled={!hasProjects || !effectiveProjectId || !name.trim() || createAlbum.isPending}
        >
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
