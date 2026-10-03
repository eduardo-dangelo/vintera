'use client';

import type { MusicItemMenuTarget } from './musicItemMenuTypes';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Popover,
  POSITION_BELOW_ANCHOR_ORIGIN,
  POSITION_BELOW_TRANSFORM_ORIGIN,
} from '@/components/common/Popover';
import { useUpdateAlbumById } from '@/queries/hooks/albums/useUpdateAlbumById';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { useUpdateSongById } from '@/queries/hooks/songs/useUpdateSongById';
import {
  glassPaperSx,
  glassPopoverCancelButtonSx,
  glassPopoverConfirmButtonSx,
} from '@/utils/glassPaperStyles';
import { toTitleCase, toTitleCaseInput } from '@/utils/toTitleCase';
import {
  createPopoverFieldSx,
  createPopoverTitleSx,
} from './createMusicPopoverStyles';

type MusicItemRenamePopoverProps = {
  open: boolean;
  target: MusicItemMenuTarget | null;
  locale: string;
  anchorEl: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  onClose: () => void;
};

export function MusicItemRenamePopover({
  open,
  target,
  locale,
  anchorEl,
  anchorPosition = null,
  onClose,
}: MusicItemRenamePopoverProps) {
  const t = useTranslations('MusicProjects');
  const updateProject = useUpdateMusicProject(locale);
  const updateSong = useUpdateSongById(locale);
  const updateAlbum = useUpdateAlbumById(locale);
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && target) {
      setName(target.name);
    }
  }, [open, target]);

  const isPending = updateProject.isPending || updateSong.isPending || updateAlbum.isPending;
  const canSave = Boolean(name.trim()) && Boolean(target);
  const isPositionAnchored = anchorPosition != null;

  const handleSave = async () => {
    if (!target || !name.trim()) {
      return;
    }
    const nextName = toTitleCase(name);
    try {
      if (target.kind === 'project') {
        await updateProject.mutateAsync({
          projectId: target.id,
          data: { name: nextName },
        });
      } else if (target.kind === 'song') {
        await updateSong.mutateAsync({
          songId: target.id,
          data: { title: nextName },
        });
      } else {
        await updateAlbum.mutateAsync({
          albumId: target.id,
          data: { name: nextName },
        });
      }
      onClose();
    } catch {
      // Keep popover open on error
    }
  };

  return (
    <Popover
      open={open && Boolean(target)}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      anchorOrigin={isPositionAnchored ? POSITION_BELOW_ANCHOR_ORIGIN : undefined}
      transformOrigin={isPositionAnchored ? POSITION_BELOW_TRANSFORM_ORIGIN : undefined}
      onClose={onClose}
      minWidth={240}
      maxWidth={280}
      showArrow={false}
      paperSx={glassPaperSx}
    >
      <Box sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography component="h2" sx={createPopoverTitleSx}>
          {t('context_menu_rename')}
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label={target?.kind === 'song' ? t('field_title') : t('field_name')}
          value={name}
          onChange={e => setName(toTitleCaseInput(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSave && !isPending) {
              e.preventDefault();
              void handleSave();
            }
          }}
          disabled={isPending}
          sx={createPopoverFieldSx}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
            sx={glassPopoverCancelButtonSx}
          >
            {t('cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              void handleSave();
            }}
            disabled={!canSave || isPending}
            sx={glassPopoverConfirmButtonSx}
          >
            {t('save')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
