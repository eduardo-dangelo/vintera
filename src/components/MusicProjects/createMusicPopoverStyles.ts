import type { PopoverOrigin } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  glassPopoverCancelButtonSx,
  glassPopoverConfirmButtonSx,
} from '@/utils/glassPaperStyles';
import { PRIMARY_GRADIENT, primaryGradientSx } from './musicListToolbarStyles';

export const CREATE_ALBUM_POPOVER_WIDTH = 280;
export const CREATE_SONG_POPOVER_WIDTH = 300;
export const CREATE_PROJECT_POPOVER_WIDTH = 320;
export const CREATE_PROJECT_POPOVER_MAX_HEIGHT = 280;

export const POPOVER_PADDING = 1.5;
export const CONTENT_GAP = 1.5;
/** Extra space below title row (added to form gap). */
export const TITLE_ROW_MARGIN_BOTTOM = 0.5;
/** Top inset for field stack (floating label sits above the input border). */
export const FIELDS_STACK_PADDING_TOP = 0.5;

/** Popover opens to the right of the viewport click point (gap applied in Popover paper margin). */
export const CREATE_POPOVER_CLICK_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'center',
  horizontal: 'left',
};
export const CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: 'center',
  horizontal: 'left',
};

export function getCreatePopoverAnchorPositionFromClick(
  event: React.MouseEvent<HTMLElement>,
): { top: number; left: number } {
  return {
    top: event.clientY,
    left: event.clientX,
  };
}

export const createPopoverTitleSx = {
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.4,
  color: 'text.primary',
} as const;

export const createPopoverFieldSx: SxProps<Theme> = {
  'overflow': 'visible',
  '& .MuiOutlinedInput-root': {
    bgcolor: (theme: Theme) => alpha(theme.palette.background.paper, 0.92),
    color: 'text.primary',
    overflow: 'visible',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    color: 'text.secondary',
    opacity: 1,
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'text.primary',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'text.primary',
  },
};

export const createPopoverSelectSx: SxProps<Theme> = {
  ...createPopoverFieldSx,
  overflow: 'visible',
};

export const requiredLabelSlotProps = {
  inputLabel: {
    sx: { '& .MuiFormLabel-asterisk': { color: 'error.main' } },
  },
} as const;

export const createPopoverCancelButtonSx: SxProps<Theme> = {
  ...glassPopoverCancelButtonSx,
  color: 'text.primary',
  minWidth: 'auto',
};

export const createPopoverCreateButtonSx: SxProps<Theme> = {
  ...glassPopoverConfirmButtonSx,
  ...primaryGradientSx,
  'color': 'common.white',
  'boxShadow': 'none',
  '&:hover': {
    color: 'common.white',
    boxShadow: 'none',
    filter: 'brightness(1.05)',
  },
  '&.Mui-disabled': {
    'background': PRIMARY_GRADIENT,
    'color': 'common.white',
    'opacity': 0.55,
    'filter': 'grayscale(1)',
    '& .MuiButton-startIcon': {
      color: 'common.white',
      opacity: 0.85,
    },
  },
};
