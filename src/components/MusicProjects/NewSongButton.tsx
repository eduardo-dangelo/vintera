'use client';

import type { SxProps, Theme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { IconButton, ListItemButton, ListItemIcon, ListItemText, Tooltip, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { CreateSongDialog } from './CreateSongDialog';
import { ExpandablePrimaryButton } from './ExpandablePrimaryButton';

type NewSongButtonProps = {
  locale: string;
  variant?: 'icon' | 'listItem' | 'toolbar';
  projectId?: number;
  iconButtonSx?: SxProps<Theme>;
};

export function NewSongButton({
  locale,
  variant = 'icon',
  projectId,
  iconButtonSx,
}: NewSongButtonProps) {
  const theme = useTheme();
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const { playHoverSound } = useHoverSound();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreated = (songId: number) => {
    router.push(`/${locale}/songs/${songId}`);
    router.refresh();
  };

  const defaultSx: SxProps<Theme> = {
    height: 30,
    width: 30,
    border: 'none',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderRadius: '6px',
    ...iconButtonSx,
  };

  return (
    <>
      {variant === 'listItem'
        ? (
            <ListItemButton
              onClick={() => setDialogOpen(true)}
              onMouseEnter={playHoverSound}
              sx={{
                'borderRadius': 1,
                'color': theme.palette.sidebar.textSecondary,
                'pl': 1,
                'pr': 1,
                'py': 0.25,
                'minHeight': 28,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  color: theme.palette.sidebar.textPrimary,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 24 }}>
                <AddIcon sx={{ fontSize: 16, color: 'rgba(200, 200, 210, 0.9)' }} />
              </ListItemIcon>
              <ListItemText
                primary={t('new_song')}
                primaryTypographyProps={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  noWrap: true,
                }}
              />
            </ListItemButton>
          )
        : variant === 'toolbar'
          ? (
              <ExpandablePrimaryButton
                label={t('new_song')}
                onClick={() => setDialogOpen(true)}
              />
            )
          : (
              <Tooltip title={t('new_song')}>
                <IconButton size="small" onClick={() => setDialogOpen(true)} sx={defaultSx}>
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
      <CreateSongDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        locale={locale}
        projectId={projectId}
        onCreated={handleCreated}
      />
    </>
  );
}
