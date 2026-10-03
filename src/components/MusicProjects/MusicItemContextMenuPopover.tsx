'use client';

import {
  Check as CheckIcon,
  DeleteOutline as DeleteOutlineIcon,
  DriveFileRenameOutline as RenameIcon,
  FilterNone as DuplicateIcon,
  LinkOutlined as LinkOutlinedIcon,
} from '@mui/icons-material';
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

const POPOVER_WIDTH = 200;

export type MusicItemContextMenuPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  onCopyLink: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  duplicating?: boolean;
  linkCopied?: boolean;
};

export function MusicItemContextMenuPopover({
  open,
  anchorEl,
  anchorPosition,
  onClose,
  onCopyLink,
  onDuplicate,
  onRename,
  onDelete,
  duplicating = false,
  linkCopied = false,
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
          onClick={onCopyLink}
          sx={contextMenuRowSx}
        >
          {linkCopied
            ? <CheckIcon sx={contextMenuIconSx} color="action" />
            : <LinkOutlinedIcon sx={contextMenuIconSx} color="action" />}
          <Typography component="span" sx={contextMenuItemTextSx}>
            {linkCopied ? t('share_copied') : t('context_menu_copy_link')}
          </Typography>
        </Box>
        <Box
          role="menuitem"
          onMouseEnter={playHoverSound}
          onClick={() => {
            if (duplicating) {
              return;
            }
            onDuplicate();
          }}
          sx={{
            ...contextMenuRowSx,
            ...(duplicating ? { opacity: 0.5, pointerEvents: 'none' } : {}),
          }}
        >
          <DuplicateIcon sx={contextMenuIconSx} color="action" />
          <Typography component="span" sx={contextMenuItemTextSx}>
            {t('context_menu_duplicate')}
          </Typography>
        </Box>
        <Box
          role="menuitem"
          onMouseEnter={playHoverSound}
          onClick={onRename}
          sx={contextMenuRowSx}
        >
          <RenameIcon sx={contextMenuIconSx} color="action" />
          <Typography component="span" sx={contextMenuItemTextSx}>
            {t('context_menu_rename')}
          </Typography>
        </Box>
        <Box
          role="menuitem"
          onMouseEnter={playHoverSound}
          onClick={onDelete}
          sx={contextMenuRowSx}
        >
          <DeleteOutlineIcon sx={contextMenuIconSx} color="error" />
          <Typography component="span" sx={contextMenuItemTextSx}>
            {t('delete')}
          </Typography>
        </Box>
      </Box>
    </Popover>
  );
}
