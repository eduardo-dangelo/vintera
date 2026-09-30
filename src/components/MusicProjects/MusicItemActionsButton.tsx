'use client';

import type { SxProps, Theme } from '@mui/material';
import type { MusicItemMenuTarget } from './musicItemMenuTypes';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';

type MusicItemActionsButtonProps = {
  target: MusicItemMenuTarget;
  onOpen: (event: React.MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => void;
  sx?: SxProps<Theme>;
};

export function MusicItemActionsButton({ target, onOpen, sx }: MusicItemActionsButtonProps) {
  const t = useTranslations('MusicProjects');

  return (
    <Tooltip title={t('context_menu_actions')}>
      <IconButton
        size="small"
        aria-label={t('context_menu_actions')}
        onMouseDown={e => e.stopPropagation()}
        onClick={(e) => {
          onOpen(e, target);
        }}
        sx={{
          'color': 'text.secondary',
          'p': 0.25,
          '& .MuiSvgIcon-root': { fontSize: 18 },
          ...sx,
        }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
