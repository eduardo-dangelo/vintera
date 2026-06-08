'use client';

import type { SxProps, Theme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { IconButton, ListItemButton, ListItemIcon, ListItemText, Tooltip, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { getCreatePopoverAnchorPositionFromClick } from './createMusicPopoverStyles';
import { CreateProjectPopover } from './CreateProjectPopover';
import { ExpandablePrimaryButton } from './ExpandablePrimaryButton';

type NewMusicProjectButtonProps = {
  locale: string;
  variant?: 'icon' | 'listItem' | 'toolbar';
  iconButtonSx?: SxProps<Theme>;
  onProjectCreated?: (projectId: number) => void;
};

export function NewMusicProjectButton({
  locale,
  variant = 'icon',
  iconButtonSx,
  onProjectCreated,
}: NewMusicProjectButtonProps) {
  const theme = useTheme();
  const t = useTranslations('MusicProjects');
  const { playHoverSound } = useHoverSound();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorPosition(getCreatePopoverAnchorPositionFromClick(event));
    setPopoverOpen(true);
  };

  const handleClose = () => {
    setPopoverOpen(false);
    setAnchorPosition(null);
  };

  const handleCreated = (id: number) => {
    onProjectCreated?.(id);
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
              onClick={handleOpen}
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
                primary={t('new_project')}
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
                label={t('new_project')}
                onClick={handleOpen}
              />
            )
          : (
              <Tooltip title={t('new_project')}>
                <IconButton size="small" onClick={handleOpen} sx={defaultSx}>
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
      <CreateProjectPopover
        open={popoverOpen}
        anchorPosition={anchorPosition}
        onClose={handleClose}
        locale={locale}
        onCreated={handleCreated}
      />
    </>
  );
}
