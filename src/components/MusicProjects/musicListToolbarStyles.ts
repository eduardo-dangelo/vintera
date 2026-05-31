import type { SxProps, Theme } from '@mui/material/styles';

export const primaryGradientSx: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  color: '#ffffff',
};

export function getToolbarIconButtonSx(theme: Theme): SxProps<Theme> {
  return {
    'height': 30,
    'width': 30,
    'border': 'none',
    'bgcolor': 'transparent',
    'borderRadius': '6px',
    'transition': 'all 0.2s ease',
    '&:hover': {
      bgcolor: theme.palette.action.hover,
    },
  };
}
