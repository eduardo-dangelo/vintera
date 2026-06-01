import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const glassPaperSx = (theme: Theme) => ({
  bgcolor: alpha(theme.palette.background.paper, 0.62),
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
});
