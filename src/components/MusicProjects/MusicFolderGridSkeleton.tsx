'use client';

import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import { Box } from '@mui/material';
import { getFolderGridSizes } from '@/utils/folderGridSizes';
import { MusicCardSkeleton } from './MusicCardSkeleton';

const DEFAULT_CARD_COUNT = 8;

type MusicFolderGridSkeletonProps = {
  cardSize?: ListFolderCardSize;
  count?: number;
};

export function MusicFolderGridSkeleton({
  cardSize = 'medium',
  count = DEFAULT_CARD_COUNT,
}: MusicFolderGridSkeletonProps) {
  const gridSizes = getFolderGridSizes(cardSize);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      {Array.from({ length: count }, (_, index) => (
        <Box
          key={index}
          sx={{
            display: 'block',
            width: gridSizes,
            flexShrink: 0,
            p: 1,
          }}
        >
          <MusicCardSkeleton cardSize={cardSize} />
        </Box>
      ))}
    </Box>
  );
}
