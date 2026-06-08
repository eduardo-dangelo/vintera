'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useCreateAlbum } from '@/queries/hooks/music-projects/useCreateAlbum';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';
import { getGlassSelectMenuProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import { toTitleCase, toTitleCaseInput } from '@/utils/toTitleCase';
import {
  CREATE_ALBUM_POPOVER_WIDTH,
  createPopoverFieldSx,
  createPopoverSelectSx,
  requiredLabelSlotProps,
} from './createMusicPopoverStyles';
import { MusicCreatePopoverLayout } from './MusicCreatePopoverLayout';

type CreateAlbumPopoverProps = {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  locale: string;
  projectId?: number;
  onCreated?: (albumId: number) => void;
};

export function CreateAlbumPopover({
  open,
  anchorPosition,
  onClose,
  locale,
  projectId: presetProjectId,
  onCreated,
}: CreateAlbumPopoverProps) {
  const t = useTranslations('MusicProjects');
  const createAlbum = useCreateAlbum(locale);
  const { data: projects } = useMusicProjects(locale);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = presetProjectId
    ?? (selectedProjectId === '' ? undefined : selectedProjectId);
  const hasProjects = (projects?.length ?? 0) > 0;

  useEffect(() => {
    if (open && presetProjectId) {
      setSelectedProjectId(presetProjectId);
    }
  }, [open, presetProjectId]);

  const handleClose = () => {
    setName('');
    if (!presetProjectId) {
      setSelectedProjectId('');
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveProjectId || !name.trim()) {
      return;
    }
    const album = await createAlbum.mutateAsync({
      projectId: effectiveProjectId,
      name: toTitleCase(name),
    });
    handleClose();
    onCreated?.(album.id);
  };

  return (
    <MusicCreatePopoverLayout
      open={open}
      anchorPosition={anchorPosition}
      onClose={handleClose}
      title={t('new_album_title')}
      titleIconKind="album"
      width={CREATE_ALBUM_POPOVER_WIDTH}
      onSubmit={handleSubmit}
      submitDisabled={!hasProjects || !effectiveProjectId || !name.trim()}
      submitLoading={createAlbum.isPending}
      initialFocusRef={nameInputRef}
    >
      <TextField
        inputRef={nameInputRef}
        fullWidth
        size="small"
        label={t('field_name')}
        value={name}
        onChange={e => setName(toTitleCaseInput(e.target.value))}
        required
        sx={createPopoverFieldSx}
        slotProps={requiredLabelSlotProps}
      />
      {!presetProjectId && hasProjects && (
        <FormControl fullWidth size="small" required sx={createPopoverSelectSx}>
          <InputLabel
            required
            sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
          >
            {t('select_project')}
          </InputLabel>
          <Select
            value={selectedProjectId}
            label={t('select_project')}
            MenuProps={getGlassSelectMenuProps()}
            onChange={e => setSelectedProjectId(e.target.value as number)}
          >
            {projects?.map(project => (
              <MenuItem key={project.id} sx={glassMenuItemSx} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {!hasProjects && (
        <TextField
          fullWidth
          size="small"
          disabled
          helperText={t('create_project_first')}
          sx={createPopoverFieldSx}
        />
      )}
    </MusicCreatePopoverLayout>
  );
}
