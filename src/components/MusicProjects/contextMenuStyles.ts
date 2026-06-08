import { glassMenuItemSx, glassPopoverItemTextSx } from '@/utils/glassPaperStyles';

export const contextMenuItemTextSx = glassPopoverItemTextSx;

export const contextMenuIconSx = {
  fontSize: 16,
} as const;

export const contextMenuRowSx = {
  'display': 'flex',
  'alignItems': 'center',
  'gap': glassMenuItemSx.gap,
  'px': glassMenuItemSx.px,
  'py': glassMenuItemSx.py,
  'minHeight': glassMenuItemSx.minHeight,
  'borderRadius': 1,
  'cursor': 'pointer',
  'userSelect': 'none',
  'transition': 'background-color 0.15s ease',
  '&:hover': {
    bgcolor: 'action.hover',
  },
} as const;
