'use client';

import { Box, TextField } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useCreateMusicProject } from '@/queries/hooks/music-projects/useCreateMusicProject';
import { toTitleCase } from '@/utils/toTitleCase';
import {
  CREATE_PROJECT_POPOVER_MAX_HEIGHT,
  CREATE_PROJECT_POPOVER_WIDTH,
  createPopoverFieldSx,
  requiredLabelSlotProps,
} from './createMusicPopoverStyles';
import { MusicCreatePopoverLayout } from './MusicCreatePopoverLayout';

const PRESET_COLORS = ['#7c3aed', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

type CreateProjectPopoverProps = {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  locale: string;
  onCreated?: (projectId: number) => void;
};

export function CreateProjectPopover({
  open,
  anchorPosition,
  onClose,
  locale,
  onCreated,
}: CreateProjectPopoverProps) {
  const t = useTranslations('MusicProjects');
  const createProject = useCreateMusicProject(locale);
  const [name, setName] = useState('');
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
    setGenre('');
    setColor(PRESET_COLORS[0]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    const project = await createProject.mutateAsync({
      name: toTitleCase(name),
      genre: genre.trim() || undefined,
      color,
    });
    handleClose();
    onCreated?.(project.id);
  };

  return (
    <MusicCreatePopoverLayout
      open={open}
      anchorPosition={anchorPosition}
      onClose={handleClose}
      title={t('new_project_title')}
      titleIconKind="project"
      width={CREATE_PROJECT_POPOVER_WIDTH}
      maxHeight={CREATE_PROJECT_POPOVER_MAX_HEIGHT}
      onSubmit={handleSubmit}
      submitDisabled={!name.trim()}
      submitLoading={createProject.isPending}
    >
      <TextField
        inputRef={nameInputRef}
        fullWidth
        size="small"
        label={t('field_name')}
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={e => setName(toTitleCase(e.target.value))}
        required
        sx={createPopoverFieldSx}
        slotProps={requiredLabelSlotProps}
      />
      <TextField
        fullWidth
        size="small"
        label={t('genre')}
        value={genre}
        onChange={e => setGenre(e.target.value)}
        placeholder="Indie rock, Jazz, Electronic..."
        sx={createPopoverFieldSx}
      />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map(c => (
          <Box
            key={c}
            component="button"
            type="button"
            onClick={() => setColor(c)}
            aria-label={t('color')}
            sx={{
              'width': 32,
              'height': 32,
              'borderRadius': '50%',
              'bgcolor': c,
              'cursor': 'pointer',
              'border': color === c ? '3px solid white' : '2px solid transparent',
              'boxShadow': color === c ? `0 0 0 2px ${c}` : 'none',
              'transition': 'transform 0.15s',
              'p': 0,
              '&:hover': { transform: 'scale(1.1)' },
            }}
          />
        ))}
      </Box>
    </MusicCreatePopoverLayout>
  );
}
