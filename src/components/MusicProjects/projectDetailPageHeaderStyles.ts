import type { SxProps, Theme } from '@mui/material/styles';

/** Square band logo on project detail header (out of flow, vertically centered on title). */
export const PROJECT_DETAIL_LOGO_SIZE = 104;

/** Compact logo when the sticky bar is pinned (fits within topbar row height). */
export const PROJECT_DETAIL_LOGO_SIZE_STUCK = 40;

/** Smaller stuck logo on mobile — avoids clipping under the fixed app bar. */
export const PROJECT_DETAIL_LOGO_SIZE_STUCK_MOBILE = 32;

export const LOGO_GAP_PX = 12;

export function getProjectDetailLogoSize(isStuck: boolean, isMobile = false): number {
  if (!isStuck) {
    return PROJECT_DETAIL_LOGO_SIZE;
  }
  return isMobile ? PROJECT_DETAIL_LOGO_SIZE_STUCK_MOBILE : PROJECT_DETAIL_LOGO_SIZE_STUCK;
}

/** Extra space below title/actions vs list header py:2 (16px). */
export const PROJECT_DETAIL_BOTTOM_PADDING_PX = { xs: 20, md: 24 } as const;

/** In-flow horizontal reservation for the logo; logo is painted in the left group. */
export function getProjectDetailLogoSpacerSx(isStuck: boolean, isMobile = false): SxProps<Theme> {
  const logoSize = getProjectDetailLogoSize(isStuck, isMobile);

  return {
    'width': logoSize + LOGO_GAP_PX,
    'flexShrink': 0,
    '@media (prefers-reduced-motion: no-preference)': {
      transition: 'width 0.2s ease',
    },
  };
}

export function getProjectDetailLogoAbsoluteSx(): SxProps<Theme> {
  return {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    lineHeight: 0,
  };
}

export function getProjectDetailLogoButtonSx(): SxProps<Theme> {
  return {
    'p': 0,
    'border': 'none',
    'background': 'none',
    'borderRadius': 1,
    'lineHeight': 0,
    '@media (prefers-reduced-motion: no-preference)': {
      '& img, & > div': {
        transition: 'width 0.2s ease, height 0.2s ease',
      },
    },
  };
}

/** Inner padding only — height comes from the main row (matches list overlap). */
export function getProjectDetailStickyBarContentSx(isStuck: boolean): SxProps<Theme> {
  const bottomPadXs = isStuck ? 12 : PROJECT_DETAIL_BOTTOM_PADDING_PX.xs;
  const bottomPadMd = isStuck ? 12 : PROJECT_DETAIL_BOTTOM_PADDING_PX.md;
  const topPad = isStuck ? 8 : 16;

  return {
    'position': 'relative',
    'overflow': 'visible',
    'px': { xs: 2, sm: 3 },
    'pt': `${topPad}px`,
    'pb': { xs: `${bottomPadXs}px`, md: `${bottomPadMd}px` },
    '@media (prefers-reduced-motion: no-preference)': {
      transition: 'padding 0.2s ease',
    },
  };
}

export function getProjectDetailMainRowSx(isStuck: boolean): SxProps<Theme> {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: isStuck ? 1.5 : 2,
    flexWrap: 'nowrap',
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
  };
}

export function getProjectDetailLeftGroupSx(): SxProps<Theme> {
  return {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: '1 1 0',
    overflow: 'visible',
    flexWrap: 'nowrap',
  };
}

export function getProjectDetailTitleGroupSx(): SxProps<Theme> {
  return {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    flex: '1 1 0',
    flexWrap: 'nowrap',
  };
}

export function getProjectDetailActionsSx(): SxProps<Theme> {
  return {
    flexShrink: 0,
  };
}

/** Placeholder logo box when the project has no cover image. */
export function getProjectDetailLogoPlaceholderSx(
  appTheme: Theme,
  onHeroImage: boolean,
): SxProps<Theme> {
  const isLight = appTheme.palette.mode === 'light';

  if (isLight && onHeroImage) {
    return {
      bgcolor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
    };
  }

  if (isLight) {
    return {
      bgcolor: appTheme.palette.background.paper,
      border: `1px solid ${appTheme.palette.divider}`,
      boxShadow: appTheme.shadows[2],
    };
  }

  return {
    bgcolor: 'action.hover',
  };
}

/** Shared frosted glass panel — breadcrumbs, stats counters, etc. */
export function getProjectDetailGlassPanelSx(): SxProps<Theme> {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    borderRadius: 1,
    px: 1.25,
    py: 0.625,
    bgcolor: 'rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  };
}

/** Frosted pill behind hero breadcrumbs — matches hero camera button / logo corner radius. */
export function getProjectDetailBreadcrumbWrapperSx(): SxProps<Theme> {
  return {
    ...getProjectDetailGlassPanelSx(),
    position: 'absolute',
    top: { xs: 12, md: 16 },
    left: { xs: 16, sm: 24 },
    zIndex: 2,
    maxWidth: { xs: 'calc(100% - 72px)', sm: 'calc(100% - 96px)' },
  };
}

export function getProjectDetailBreadcrumbSx(textColor: string = '#fff'): SxProps<Theme> {
  return {
    'minWidth': 0,
    '& .MuiBreadcrumbs-ol': {
      flexWrap: 'nowrap',
    },
    '& .MuiBreadcrumbs-li': {
      color: textColor,
      fontSize: '0.8125rem',
      minWidth: 0,
    },
    '& .MuiBreadcrumbs-separator': {
      color: textColor,
      opacity: 0.55,
    },
    '& a': {
      'color': 'inherit',
      'textDecoration': 'none',
      '&:hover': { textDecoration: 'none' },
      '&:focus': { textDecoration: 'none' },
    },
  };
}
