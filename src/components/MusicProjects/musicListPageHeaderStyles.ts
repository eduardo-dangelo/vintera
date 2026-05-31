import type { SxProps, Theme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

export function createHeroDarkTheme(baseTheme: Theme): Theme {
  return createTheme(baseTheme, {
    palette: {
      mode: 'dark',
      background: {
        default: '#252526',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#cccccc',
        secondary: 'rgba(204, 204, 204, 0.7)',
      },
      action: {
        hover: 'rgba(255, 255, 255, 0.08)',
        selected: 'rgba(255, 255, 255, 0.12)',
      },
    },
  });
}

export function getHeroRootSx(): SxProps<Theme> {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: { xs: 220, md: 280 },
    mb: 4,
    mx: { xs: -2, sm: -3 },
    width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
  };
}

export function getHeroBackgroundSx(theme: Theme): SxProps<Theme> {
  const isLight = theme.palette.mode === 'light';

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
    background: isLight
      ? 'linear-gradient(135deg, #e8ecf1 0%, #f0f4f8 100%)'
      : 'linear-gradient(135deg, #1e1e22 0%, #2a2a30 100%)',
  };
}

export function getHeroOverlaySx(theme: Theme, hasHeroImage: boolean): SxProps<Theme> {
  const isLight = theme.palette.mode === 'light';

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: hasHeroImage
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.45) 45%, transparent 100%)'
      : isLight
        ? 'linear-gradient(to top, rgba(0, 0, 0, 0.12) 0%, transparent 60%)'
        : 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%)',
    pointerEvents: 'none',
  };
}

export function getHeroTitleSx(hasHeroImage: boolean, isStuck: boolean): SxProps<Theme> {
  return {
    fontWeight: 700,
    minWidth: 0,
    ...(!isStuck
      ? {
          color: 'text.primary',
          ...(hasHeroImage ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)' } : {}),
        }
      : {}),
  };
}

export function getHeroToolbarWrapperSx(isStuck: boolean): SxProps<Theme> {
  if (isStuck) {
    return { flexShrink: 0 };
  }

  return {
    'flexShrink': 0,
    '& .MuiSvgIcon-root': {
      color: 'text.secondary !important',
    },
    '& > div > .MuiBox-root:nth-of-type(2)': {
      bgcolor: 'rgba(255, 255, 255, 0.2)',
    },
  };
}

export function getStickyBarSx(
  theme: Theme,
  isMobile: boolean,
  isStuck: boolean,
): SxProps<Theme> {
  return {
    position: 'sticky',
    top: isMobile ? 56 : 0,
    zIndex: theme.zIndex.appBar - 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
    px: { xs: 2, sm: 3 },
    py: 2,
    ...(isStuck
      ? {
          backdropFilter: 'blur(2px)',
          bgcolor: theme.palette.mode === 'light'
            ? 'rgba(248, 249, 250, 0.8)'
            : 'rgba(37, 37, 38, 0.8)',
        }
      : {
          bgcolor: 'transparent',
        }),
  };
}
