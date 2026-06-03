import type { SxProps, Theme } from '@mui/material/styles';

/** Square band logo on project detail header (out of flow, vertically centered on title). */
export const PROJECT_DETAIL_LOGO_SIZE = 104;

export const LOGO_GAP_PX = 12;

/** Extra space below title/actions vs list header py:2 (16px). */
export const PROJECT_DETAIL_BOTTOM_PADDING_PX = { xs: 20, md: 24 } as const;

/** In-flow horizontal reservation for the logo; logo is painted in the left group. */
export function getProjectDetailLogoSpacerSx(): SxProps<Theme> {
  return {
    width: PROJECT_DETAIL_LOGO_SIZE + LOGO_GAP_PX,
    flexShrink: 0,
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
    p: 0,
    border: 'none',
    background: 'none',
    borderRadius: 1,
    lineHeight: 0,
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
    overflow: 'hidden',
    flexWrap: 'nowrap',
  };
}

export function getProjectDetailActionsSx(): SxProps<Theme> {
  return {
    flexShrink: 0,
  };
}
