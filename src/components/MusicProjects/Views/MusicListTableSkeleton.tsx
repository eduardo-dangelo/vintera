'use client';

import { Box, Skeleton, useTheme } from '@mui/material';
import { MUSIC_LIST_COVER_SIZE } from '@/components/MusicProjects/musicCardStyles';
import {
  getMusicListTableContainerSx,
  getMusicListTableRowSx,
} from './musicListTableStyles';

const DEFAULT_ROW_COUNT = 6;

type MusicListTableSkeletonProps = {
  rowCount?: number;
};

export function MusicListTableSkeleton({ rowCount = DEFAULT_ROW_COUNT }: MusicListTableSkeletonProps) {
  const theme = useTheme();

  return (
    <Box sx={getMusicListTableContainerSx()}>
      {Array.from({ length: rowCount }, (_, index) => (
        <Box key={index} sx={getMusicListTableRowSx(theme)}>
          <Skeleton
            variant="rounded"
            width={MUSIC_LIST_COVER_SIZE}
            height={MUSIC_LIST_COVER_SIZE}
            sx={{ flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="45%" height={16} sx={{ mt: 0.25 }} />
          </Box>
          <Skeleton variant="rounded" width={56} height={24} />
          <Skeleton variant="rounded" width={56} height={24} />
          <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
          <Skeleton
            variant="text"
            width={72}
            height={16}
            sx={{ display: { xs: 'none', sm: 'block' }, ml: 'auto' }}
          />
          <Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} />
        </Box>
      ))}
    </Box>
  );
}
