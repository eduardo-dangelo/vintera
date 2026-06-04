import type { Components, Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

export const PRIMARY_GRADIENT = 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)';
export const PRIMARY_GRADIENT_START = '#8b5cf6';
export const PRIMARY_GRADIENT_END = '#3b82f6';

export function getPrimaryGradient(theme: Theme): string {
  return theme.palette.gradients.primary;
}

export function primaryGradientFillSx(theme: Theme): SystemStyleObject<Theme> {
  return {
    background: getPrimaryGradient(theme),
    backgroundColor: 'transparent',
    color: theme.palette.primary.contrastText,
  };
}

export function primaryGradientTextSx(theme: Theme): SystemStyleObject<Theme> {
  return {
    background: getPrimaryGradient(theme),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };
}

export function primaryGradientBorderSx(
  theme: Theme,
  width = 2,
  bgColor?: string,
): SystemStyleObject<Theme> {
  const innerBg = bgColor ?? theme.palette.background.paper;
  return {
    border: `${width}px solid transparent`,
    backgroundImage: `linear-gradient(${innerBg}, ${innerBg}), ${getPrimaryGradient(theme)}`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  };
}

export function primaryGradientBorderBottomSx(theme: Theme, width = 2): SystemStyleObject<Theme> {
  return {
    borderBottom: `${width}px solid`,
    borderImage: `${getPrimaryGradient(theme)} 1`,
  };
}

export function primaryGradientLinkButtonSx(theme: Theme): SystemStyleObject<Theme> {
  return {
    border: 'none',
    backgroundColor: 'transparent',
    p: 0,
    m: 0,
    font: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none',
    ...primaryGradientTextSx(theme),
  };
}

function gradientFillStyles(theme: Theme) {
  const gradient = getPrimaryGradient(theme);
  return {
    background: gradient,
    backgroundColor: 'transparent',
  };
}

function gradientTextStyles(theme: Theme) {
  return {
    background: getPrimaryGradient(theme),
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };
}

export function getMuiPrimaryGradientOverrides(): Components<Omit<Theme, 'components'>> {
  return {
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          ...gradientFillStyles(theme),
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected': gradientTextStyles(theme),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: ({ theme }) => ({
          ...gradientFillStyles(theme),
          'boxShadow': 'none',
          '&:hover': {
            ...gradientFillStyles(theme),
            boxShadow: 'none',
            filter: 'brightness(1.05)',
          },
        }),
        textPrimary: ({ theme }) => gradientTextStyles(theme),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'primary' ? gradientTextStyles(theme) : {}),
        }),
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: ({ theme }) => ({
          ...gradientFillStyles(theme),
          '&:hover': {
            ...gradientFillStyles(theme),
            filter: 'brightness(1.05)',
          },
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: ({ theme }) => gradientFillStyles(theme),
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: ({ theme }) => ({
          stroke: theme.palette.primary.main,
        }),
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          ...gradientFillStyles(theme),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: ({ theme }) => ({
          ...gradientFillStyles(theme),
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-checked': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-checked': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: ({ theme }) => ({
          '&.Mui-checked': {
            'color': theme.palette.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main,
              opacity: 0.5,
            },
          },
        }),
      },
    },
  };
}
