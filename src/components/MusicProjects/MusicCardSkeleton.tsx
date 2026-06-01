'use client';

import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import { Box, Card, CardContent, Skeleton } from '@mui/material';
import {
  getMusicCardContentPadding,
  getMusicCardCoverSize,
} from './musicCardStyles';

type MusicCardSkeletonProps = {
  cardSize?: ListFolderCardSize;
};

export function MusicCardSkeleton({ cardSize = 'medium' }: MusicCardSkeletonProps) {
  const coverSize = getMusicCardCoverSize(cardSize);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent
        sx={{
          p: getMusicCardContentPadding(cardSize),
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Skeleton
          variant="rounded"
          width={coverSize}
          height={coverSize}
          sx={{ flexShrink: 0 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="75%" height={28} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Skeleton variant="rounded" width={64} height={24} />
            <Skeleton variant="rounded" width={64} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
