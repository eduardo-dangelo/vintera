'use client';

import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  Popover,
  POSITION_BELOW_ANCHOR_ORIGIN,
  POSITION_BELOW_TRANSFORM_ORIGIN,
} from '@/components/common/Popover';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import {
  contextMenuIconSx,
  contextMenuItemTextSx,
  contextMenuRowSx,
} from './contextMenuStyles';

const POPOVER_WIDTH = 168;

export type MusicItemContextMenuPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onView: () => void;
  onDelete: () => void;
};

export function MusicItemContextMenuPopover({
  open,
  anchorEl,
  anchorPosition,
  onClose,
  onView,
  onDelete,
}: MusicItemContextMenuPopoverProps) {
  const t = useTranslations('MusicProjects');
  const { playHoverSound } = useHoverSound();
  const isRightClickAnchor = anchorPosition != null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      anchorOrigin={isRightClickAnchor ? POSITION_BELOW_ANCHOR_ORIGIN : undefined}
      transformOrigin={isRightClickAnchor ? POSITION_BELOW_TRANSFORM_ORIGIN : undefined}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      showArrow={false}
      paperSx={glassPaperSx}
    >
      <Box sx={{ py: 0.5 }}>
        <Box
          role="menuitem"
          onMouseEnter={playHoverSound}
          onClick={() => {
            onView();
            onClose();
          }}
          sx={contextMenuRowSx}
        >
          <VisibilityIcon sx={contextMenuIconSx} color="action" />
          <Typography component="span" sx={contextMenuItemTextSx}>
            {t('context_menu_view')}
          </Typography>
        </Box>
        <Box
          role="menuitem"
          onMouseEnter={playHoverSound}
          onClick={() => {
            onDelete();
          }}
          sx={{
            ...contextMenuRowSx,
            '& .MuiSvgIcon-root': { color: 'error.main' },
          }}
        >
          <DeleteIcon sx={contextMenuIconSx} />
          <Typography component="span" sx={contextMenuItemTextSx}>
            {t('delete')}
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
}
