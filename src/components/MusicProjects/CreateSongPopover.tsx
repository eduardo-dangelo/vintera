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
import { useCreateSong } from '@/queries/hooks/music-projects/useCreateSong';
import { useMusicProject } from '@/queries/hooks/music-projects/useMusicProject';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';
import { toTitleCase, toTitleCaseInput } from '@/utils/toTitleCase';
import {
  CREATE_SONG_POPOVER_WIDTH,
  createPopoverFieldSx,
  createPopoverSelectSx,
  requiredLabelSlotProps,
} from './createMusicPopoverStyles';
import { MusicCreatePopoverLayout } from './MusicCreatePopoverLayout';

type CreateSongPopoverProps = {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  locale: string;
  projectId?: number;
  onCreated?: (songId: number) => void;
};

export function CreateSongPopover({
  open,
  anchorPosition,
  onClose,
  locale,
  projectId: presetProjectId,
  onCreated,
}: CreateSongPopoverProps) {
  const t = useTranslations('MusicProjects');
  const createSong = useCreateSong(locale);
  const { data: projects } = useMusicProjects(locale);
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState<number | ''>('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = presetProjectId
    ?? (selectedProjectId === '' ? undefined : selectedProjectId);

  const { data: projectData } = useMusicProject(locale, effectiveProjectId ?? 0);
  const albums = effectiveProjectId ? (projectData?.albums ?? []) : [];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    const song = await createSong.mutateAsync({
      projectId: effectiveProjectId,
      title: toTitleCase(title),
      albumId: effectiveProjectId && albumId !== '' ? albumId : null,
    });
    handleClose();
    onCreated?.(song.id);
  };

  return (
    <MusicCreatePopoverLayout
      open={open}
      anchorPosition={anchorPosition}
      onClose={handleClose}
      title={t('new_song_title')}
      titleIconKind="song"
      width={CREATE_SONG_POPOVER_WIDTH}
      onSubmit={handleSubmit}
      submitDisabled={!title.trim()}
      submitLoading={createSong.isPending}
    >
      <TextField
        inputRef={titleInputRef}
        fullWidth
        size="small"
        label={t('field_title')}
        value={title}
        onChange={e => setTitle(toTitleCaseInput(e.target.value))}
        required
        sx={createPopoverFieldSx}
        slotProps={requiredLabelSlotProps}
      />
      {!presetProjectId && (
        <FormControl fullWidth size="small" sx={createPopoverSelectSx}>
          <InputLabel>{t('select_project')}</InputLabel>
          <Select
            value={selectedProjectId}
            label={t('select_project')}
            onChange={(e) => {
              const raw = e.target.value as number | '';
              if (raw === '') {
                setSelectedProjectId('');
              } else {
                setSelectedProjectId(raw);
              }
              setAlbumId('');
            }}
          >
            <MenuItem value="">{t('project_none')}</MenuItem>
            {projects?.map(project => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {effectiveProjectId && albums.length > 0 && (
        <FormControl fullWidth size="small" sx={createPopoverSelectSx}>
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
    </MusicCreatePopoverLayout>
  );
}
