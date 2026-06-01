import type { SxProps, Theme } from '@mui/material/styles';

export const musicListEmptyStateRootSx: SxProps<Theme> = {
  textAlign: 'center',
  py: 5,
  px: 3,
  borderRadius: 4,
  border: '1px dashed',
  borderColor: 'divider',
  bgcolor: 'action.hover',
};

export const musicListEmptyStateIconSx: SxProps<Theme> = {
  mb: 1.5,
};

export const musicListEmptyStateTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  mb: 1,
};

export const musicListEmptyStateDescriptionSx: SxProps<Theme> = {
  maxWidth: 400,
  mx: 'auto',
};
