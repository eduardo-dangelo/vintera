import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const glassPaperSx = (theme: Theme) => ({
  bgcolor: alpha(theme.palette.background.paper, 0.62),
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
});

export const globalTopbarGlassSx = (theme: Theme) => ({
  bgcolor: alpha(
    theme.palette.background.default,
    theme.palette.mode === 'light' ? 0.55 : 0.6,
  ),
  backdropFilter: 'blur(6px) saturate(1.15)',
  WebkitBackdropFilter: 'blur(6px) saturate(1.15)',
});

/** Matches context menu item typography (Sidebar / MusicItemContextMenu). */
export const glassPopoverItemTextSx = {
  fontSize: '0.75rem',
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'text.primary',
} as const;

export const glassPopoverMessageTextSx = {
  ...glassPopoverItemTextSx,
} as const;

const glassPopoverButtonTypographySx = {
  fontSize: glassPopoverItemTextSx.fontSize,
  fontWeight: glassPopoverItemTextSx.fontWeight,
  lineHeight: glassPopoverItemTextSx.lineHeight,
} as const;

const glassPopoverButtonBaseSx = {
  ...glassPopoverButtonTypographySx,
  'textTransform': 'capitalize',
  'minHeight': 28,
  'py': 0.45,
  'px': 1.25,
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    '& .MuiSvgIcon-root': { fontSize: 16 },
  },
} as const;

export const glassPopoverCancelButtonSx = {
  ...glassPopoverButtonBaseSx,
  'color': 'text.primary',
  'borderColor': 'divider',
  '&:hover': {
    borderColor: 'text.primary',
    bgcolor: 'action.hover',
  },
} as const;

export const glassPopoverConfirmButtonSx = {
  ...glassPopoverButtonBaseSx,
  'color': 'common.white',
  '&:hover': {
    color: 'common.white',
  },
} as const;
