import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { getMusicCardHoverSx } from './musicCardStyles';

export const projectDetailEmptyStateRootSx: SxProps<Theme> = {
  width: '100%',
  pt: 0.5,
};

export const projectDetailEmptyStateTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  mb: 0.75,
};

export const projectDetailEmptyStateDescriptionSx: SxProps<Theme> = {
  maxWidth: 520,
  mb: 3,
  lineHeight: 1.5,
};

export const projectDetailEmptyStateGridSx: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 2,
  width: '100%',
};

export function projectDetailEmptyStateCardSx(theme: Theme): SxProps<Theme> {
  const cardHover = getMusicCardHoverSx()['&:hover'] as Record<string, unknown>;

  return {
    'p': 2.5,
    'display': 'flex',
    'alignItems': 'flex-start',
    'gap': 2,
    'cursor': 'pointer',
    'textAlign': 'left',
    'bgcolor': 'background.paper',
    'border': '1px solid',
    'borderColor': 'divider',
    'borderRadius': 3,
    'transition': 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
    '&:hover': {
      ...cardHover,
      borderColor: alpha(theme.palette.primary.main, 0.4),
      bgcolor: alpha(theme.palette.primary.main, 0.03),
    },
    '&:hover .project-detail-empty-icon': {
      bgcolor: alpha(theme.palette.primary.main, 0.14),
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  };
}

export function projectDetailEmptyStateIconContainerSx(theme: Theme): SxProps<Theme> {
  return {
    width: 64,
    height: 64,
    borderRadius: 2.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    transition: 'background-color 0.2s ease',
  };
}

export const projectDetailEmptyStateCardTextSx: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
  pt: 0.25,
};

export const projectDetailEmptyStateCardTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  fontSize: '0.938rem',
  lineHeight: 1.3,
  mb: 0.5,
};

export const projectDetailEmptyStateCardDescSx: SxProps<Theme> = {
  fontSize: '0.813rem',
  lineHeight: 1.45,
};

export const projectDetailEmptyStateReadonlySx: SxProps<Theme> = {
  textAlign: 'center',
  py: 6,
  px: 3,
};
