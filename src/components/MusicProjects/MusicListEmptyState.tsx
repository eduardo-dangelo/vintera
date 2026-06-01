'use client';

import type { GradientMusicIconKind } from './GradientIcon';
import { Box, Typography } from '@mui/material';
import { GradientIcon } from './GradientIcon';
import {
  musicListEmptyStateDescriptionSx,
  musicListEmptyStateIconSx,
  musicListEmptyStateRootSx,
  musicListEmptyStateTitleSx,
} from './musicListEmptyStateStyles';

type MusicListEmptyStateProps = {
  kind: GradientMusicIconKind;
  title: string;
  description?: string;
};

export function MusicListEmptyState({ kind, title, description }: MusicListEmptyStateProps) {
  return (
    <Box sx={musicListEmptyStateRootSx}>
      <GradientIcon kind={kind} sx={musicListEmptyStateIconSx} />
      <Typography variant="h6" sx={musicListEmptyStateTitleSx}>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={musicListEmptyStateDescriptionSx}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
