import { glassPopoverItemTextSx } from '@/utils/glassPaperStyles';

export const contextMenuItemTextSx = glassPopoverItemTextSx;

export const contextMenuIconSx = {
  fontSize: 16,
} as const;

export const contextMenuRowSx = {
  'display': 'flex',
  'alignItems': 'center',
  'gap': 0.75,
  'px': 1,
  'py': 0.5,
  'minHeight': 28,
  'borderRadius': 1,
  'cursor': 'pointer',
  'userSelect': 'none',
  'transition': 'background-color 0.15s ease',
  '&:hover': {
    bgcolor: 'action.hover',
  },
} as const;
