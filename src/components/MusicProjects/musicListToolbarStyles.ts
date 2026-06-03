import type { SxProps, Theme } from '@mui/material/styles';

export const PRIMARY_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
export const PRIMARY_GRADIENT_START = '#8b5cf6';
export const PRIMARY_GRADIENT_END = '#3b82f6';

export const primaryGradientSx: SxProps<Theme> = {
  background: PRIMARY_GRADIENT,
  color: '#ffffff',
};

export function getToolbarIconButtonSx(theme: Theme): SxProps<Theme> {
  return {
    'height': { xs: 28, sm: 30 },
    'width': { xs: 28, sm: 30 },
    'border': 'none',
    'bgcolor': 'transparent',
    'borderRadius': '6px',
    'transition': 'all 0.2s ease',
    '&:hover': {
      bgcolor: theme.palette.action.hover,
    },
  };
}

/** Right-aligned hero header actions row (list toolbar + project detail stats/button). */
export function getHeroActionsToolbarSx(): SxProps<Theme> {
  return {
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'flex-end',
    'gap': { xs: 0.75, sm: 1 },
    'flexWrap': 'nowrap',
    'minWidth': 0,
    '& .MuiButton-root': {
      minHeight: { xs: 30, sm: 34 },
      py: { xs: 0.375, sm: 0.5 },
      px: { xs: 1.25, sm: 1.5 },
      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
      whiteSpace: 'nowrap',
    },
    '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': {
      fontSize: { xs: 16, sm: 18 },
    },
  };
}

export function getHeroActionsDividerSx(
  theme: Theme,
  onHeroImage: boolean,
): SxProps<Theme> {
  return {
    height: 20,
    width: '1px',
    flexShrink: 0,
    alignSelf: 'center',
    bgcolor: onHeroImage ? 'rgba(255, 255, 255, 0.2)' : theme.palette.grey[300],
    mx: 0.5,
  };
}
