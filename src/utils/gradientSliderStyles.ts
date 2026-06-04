import type { Theme } from '@mui/material/styles';

export function getGradientSliderStyles(theme: Theme) {
  const primaryGradient = theme.palette.gradients.primary;

  return {
    'flex': 1,
    'mx': 0.5,
    'py': 0.5,
    '& .MuiSlider-rail': {
      height: 6,
      borderRadius: 3,
      opacity: 1,
      backgroundColor: theme.palette.action.hover,
    },
    '& .MuiSlider-track': {
      height: 6,
      borderRadius: 3,
      border: 'none',
      background: primaryGradient,
    },
    '& .MuiSlider-thumb': {
      width: 14,
      height: 14,
      background: primaryGradient,
      border: 'none',
    },
    '&.Mui-disabled': {
      '& .MuiSlider-rail': {
        backgroundColor: theme.palette.grey[200],
      },
      '& .MuiSlider-track': {
        background: theme.palette.grey[300],
        backgroundColor: theme.palette.grey[300],
      },
      '& .MuiSlider-thumb': {
        background: theme.palette.grey[300],
        backgroundColor: theme.palette.grey[300],
      },
    },
  };
}

export function getMuiSliderStyleOverrides() {
  return {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => getGradientSliderStyles(theme),
      rail: ({ theme }: { theme: Theme }) => ({
        height: 6,
        borderRadius: 3,
        opacity: 1,
        backgroundColor: theme.palette.action.hover,
      }),
      track: ({ theme }: { theme: Theme }) => ({
        height: 6,
        borderRadius: 3,
        border: 'none',
        background: theme.palette.gradients.primary,
      }),
      thumb: ({ theme }: { theme: Theme }) => ({
        width: 14,
        height: 14,
        background: theme.palette.gradients.primary,
        border: 'none',
      }),
    },
  };
}
