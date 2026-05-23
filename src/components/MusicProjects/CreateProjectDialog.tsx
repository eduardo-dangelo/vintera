'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useCreateMusicProject } from '@/queries/hooks/music-projects/useCreateMusicProject';

const PRESET_COLORS = ['#7c3aed', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  onCreated?: (projectId: number) => void;
};

export function CreateProjectDialog({
  open,
  onClose,
  locale,
  onCreated,
}: CreateProjectDialogProps) {
  const t = useTranslations('MusicProjects');
  const createProject = useCreateMusicProject(locale);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      nameInputRef.current?.focus();
    }
  }, [open]);

  const handleClose = () => {
    setName('');
    setDescription('');
    setGenre('');
    setColor(PRESET_COLORS[0]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }
    const project = await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      genre: genre.trim() || undefined,
      color,
    });
    handleClose();
    onCreated?.(project.id);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('create_project')}</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={nameInputRef}
          fullWidth
          label={t('project_name')}
          value={name}
          onChange={e => setName(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label={t('genre')}
          value={genre}
          onChange={e => setGenre(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Indie rock, Jazz, Electronic..."
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('project_description')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <Box
              key={c}
              onClick={() => setColor(c)}
              sx={{
                'width': 36,
                'height': 36,
                'borderRadius': '50%',
                'bgcolor': c,
                'cursor': 'pointer',
                'border': color === c ? '3px solid white' : '2px solid transparent',
                'boxShadow': color === c ? `0 0 0 2px ${c}` : 'none',
                'transition': 'transform 0.15s',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || createProject.isPending}
        >
          {t('create_project')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
