'use client';

import type { ButtonProps } from '@mui/material';
import { WarningAmberOutlined as WarningAmberOutlinedIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import {
  glassPaperSx,
  glassPopoverCancelButtonSx,
  glassPopoverConfirmButtonSx,
  glassPopoverMessageTextSx,
} from '@/utils/glassPaperStyles';
import {
  Popover,
  POSITION_BELOW_ANCHOR_ORIGIN,
  POSITION_BELOW_TRANSFORM_ORIGIN,
} from './Popover';

export type ConfirmPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  /** When set, positions at viewport coordinates (e.g. same point as a context menu). */
  anchorPosition?: { top: number; left: number } | null;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ButtonProps['color'];
  /** When true, confirm button shows loading and is disabled. */
  loading?: boolean;
};

export function ConfirmPopover({
  open,
  anchorEl,
  anchorPosition = null,
  onClose,
  onConfirm,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
}: ConfirmPopoverProps) {
  const handleConfirm = () => {
    onConfirm();
    // Parent is responsible for closing (e.g. after async delete succeeds)
  };

  const isPositionAnchored = anchorPosition != null;
  const showAlertIcon = confirmColor === 'error';

  return (
    <Popover
      open={open}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.75,
          }}
        >
          {showAlertIcon && (
            <WarningAmberOutlinedIcon
              sx={{
                fontSize: 16,
                color: 'warning.main',
                flexShrink: 0,
                mt: 0.125,
              }}
              aria-hidden
            />
          )}
          <Typography component="span" sx={glassPopoverMessageTextSx}>
            {message}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={glassPopoverCancelButtonSx}
          >
            {cancelLabel}
          </Button>
          <Button
            size="small"
            color={confirmColor}
            variant="contained"
            onClick={handleConfirm}
            disabled={loading}
            sx={glassPopoverConfirmButtonSx}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

ConfirmPopover.displayName = 'ConfirmPopover';
