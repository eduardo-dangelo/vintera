import type { SxProps, Theme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { globalTopbarGlassSx } from '@/utils/glassPaperStyles';

/** Overlap of sticky bar onto hero band (title sits on hero bottom). */
export const STICKY_BAR_OVERLAP = { xs: 72, md: 80 } as const;

export type HeroStickyBarOverlap = { xs: number; md: number };

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

export function getHeroBandSx(): SxProps<Theme> {
  return {
    mx: { xs: -2, sm: -3 },
    width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
    position: 'relative',
    height: { xs: 220, md: 280 },
    overflow: 'hidden',
    zIndex: 0,
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

export type HeroOverlayKind = 'image' | 'rich' | 'solid' | 'theme';

export function getHeroOverlaySx(
  theme: Theme,
  hasHeroBackdrop: boolean,
  overlayKind: HeroOverlayKind = 'image',
): SxProps<Theme> {
  const isLight = theme.palette.mode === 'light';

  let gradient: string;
  if (!hasHeroBackdrop) {
    gradient = isLight
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.12) 0%, transparent 60%)'
      : 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%)';
  } else if (overlayKind === 'image') {
    gradient = 'linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.45) 45%, transparent 100%)';
  } else if (overlayKind === 'solid') {
    gradient = isLight
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, transparent 55%)'
      : 'linear-gradient(to top, rgba(0, 0, 0, 0.28) 0%, transparent 60%)';
  } else if (overlayKind === 'theme') {
    gradient = isLight
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.12) 0%, transparent 60%)'
      : 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 60%)';
  } else {
    gradient = isLight
      ? 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 50%, transparent 100%)'
      : 'linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.25) 45%, transparent 100%)';
  }

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: gradient,
    pointerEvents: 'none',
  };
}

export function getStickyBarSx(
  theme: Theme,
  isMobile: boolean,
  showGlass: boolean,
  overlap: HeroStickyBarOverlap = STICKY_BAR_OVERLAP,
): SxProps<Theme> {
  return {
    mx: { xs: -2, sm: -3 },
    width: { xs: 'calc(100% + 32px)', sm: 'calc(100% + 48px)' },
    position: 'sticky',
    top: isMobile ? 56 : 0,
    zIndex: theme.zIndex.appBar - 1,
    mt: {
      xs: `-${overlap.xs}px`,
      md: `-${overlap.md}px`,
    },
    mb: 4,
    ...(showGlass ? getStickyHeaderGlassSx(theme) : {}),
  };
}

/**
 * Frosted glass on the full sticky bar so backdrop-filter blurs scrolling list content.
 * Must be applied to the sticky root — not a child with opaque layers behind it.
 */
export function getStickyHeaderGlassSx(theme: Theme): SxProps<Theme> {
  return globalTopbarGlassSx(theme);
}

export function getStickyBarContentSx(isStuck: boolean): SxProps<Theme> {
  return {
    'position': 'relative',
    'display': 'flex',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'gap': isStuck ? 1.5 : 2,
    'flexWrap': 'wrap',
    'px': { xs: 2, sm: 3 },
    'py': isStuck ? 1 : 2,
    '@media (prefers-reduced-motion: no-preference)': {
      transition: 'padding 0.2s ease, gap 0.2s ease',
    },
  };
}

/** Light sticky glass bar needs the app palette, not hero-on-image styling. */
export function isLightStickyHeroBar(
  theme: Theme,
  hasHeroImage: boolean,
  isHeroOutOfView: boolean,
): boolean {
  return theme.palette.mode === 'light' && hasHeroImage && isHeroOutOfView;
}

export function getHeroTitleSx(
  hasHeroImage: boolean,
  isCompact: boolean,
  isHeroOutOfView: boolean,
  theme: Theme,
): SxProps<Theme> {
  const onHeroImage = hasHeroImage && !isLightStickyHeroBar(theme, hasHeroImage, isHeroOutOfView);

  return {
    'fontWeight': 700,
    'minWidth': 0,
    'lineHeight': 1.25,
    'color': 'text.primary',
    'fontVariantLigatures': 'none',
    'fontFeatureSettings': '"liga" 0, "calt" 0',
    'fontSynthesis': 'none',
    ...(onHeroImage ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)' } : {}),
    ...(isCompact
      ? {
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
        }
      : {}),
    '@media (prefers-reduced-motion: no-preference)': {
      transition: 'font-size 0.2s ease, line-height 0.2s ease',
    },
  };
}

export function getHeroToolbarWrapperSx(
  hasHeroImage: boolean,
  isCompact: boolean,
  isHeroOutOfView: boolean,
  theme: Theme,
): SxProps<Theme> {
  const onHeroImage = hasHeroImage && !isLightStickyHeroBar(theme, hasHeroImage, isHeroOutOfView);

  const heroOnImageSx = onHeroImage
    ? {
        '& .MuiSvgIcon-root': {
          color: 'text.secondary !important',
        },
        '& > div > .MuiBox-root:nth-of-type(2)': {
          bgcolor: 'rgba(255, 255, 255, 0.2)',
        },
      }
    : {};

  const compactToolbarSx = isCompact
    ? {
        '& .MuiButton-root': {
          minHeight: 30,
          py: 0.375,
          px: 1.25,
          fontSize: '0.8125rem',
        },
        '& .MuiButton-startIcon > *:nth-of-type(1)': {
          fontSize: 16,
        },
        '& .MuiIconButton-root': {
          height: 26,
          width: 26,
        },
        '& .MuiIconButton-root .MuiSvgIcon-root': {
          fontSize: 15,
        },
        '& .MuiToggleButton-root': {
          py: 0.25,
          px: 0.625,
        },
        '& .MuiToggleButton-root .MuiSvgIcon-root': {
          fontSize: 15,
        },
        '& .MuiToggleButtonGroup-root': {
          height: 26,
        },
        '& > div > .MuiBox-root:nth-of-type(2)': {
          height: 16,
          mx: 0.5,
        },
      }
    : {};

  return {
    'flexShrink': 0,
    ...heroOnImageSx,
    ...compactToolbarSx,
    '@media (prefers-reduced-motion: no-preference)': {
      '& .MuiButton-root, & .MuiIconButton-root, & .MuiToggleButton-root': {
        transition: 'min-height 0.2s ease, padding 0.2s ease, font-size 0.2s ease',
      },
    },
  };
}
