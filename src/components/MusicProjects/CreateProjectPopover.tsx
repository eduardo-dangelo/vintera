'use client';

import { TextField } from '@mui/material';
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      nameInputRef.current?.focus();
    }
  }, [open]);

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    const project = await createProject.mutateAsync({
      name: toTitleCase(name),
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
    </MusicCreatePopoverLayout>
  );
}
