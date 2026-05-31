import type { SxProps, Theme } from '@mui/material/styles';

export function getHeroRootSx(): SxProps<Theme> {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: { xs: 180, md: 220 },
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

export function getHeroOverlaySx(theme: Theme): SxProps<Theme> {
  const isLight = theme.palette.mode === 'light';

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: isLight
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.12) 0%, transparent 60%)'
      : 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%)',
    pointerEvents: 'none',
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
