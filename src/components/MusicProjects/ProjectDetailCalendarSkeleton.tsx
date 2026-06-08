'use client';

import { Box, Skeleton } from '@mui/material';

const COMPACT_GRID_ROWS = 6;
const COMPACT_GRID_COLS = 7;
const UPCOMING_PLACEHOLDER_COUNT = 3;

type ProjectDetailCalendarSkeletonProps = {
  viewMode: 'calendar' | 'upcoming';
};

export function ProjectDetailCalendarSkeleton({ viewMode }: ProjectDetailCalendarSkeletonProps) {
  if (viewMode === 'upcoming') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {Array.from({ length: UPCOMING_PLACEHOLDER_COUNT }, (_, index) => (
          <Skeleton
            key={`upcoming-skeleton-${index}`}
            variant="rounded"
            height={72}
            sx={{ borderRadius: 1.5 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="text" width={72} height={22} />
          <Skeleton variant="text" width={40} height={22} />
        </Box>
        <Skeleton variant="rounded" width={128} height={30} sx={{ borderRadius: 1 }} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
          mb: 0.5,
        }}
      >
        {Array.from({ length: COMPACT_GRID_COLS }, (_, index) => (
          <Skeleton
            key={`day-header-skeleton-${index}`}
            variant="text"
            height={14}
            sx={{ mx: 'auto', width: '55%' }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0.5,
        }}
      >
        {Array.from({ length: COMPACT_GRID_ROWS * COMPACT_GRID_COLS }, (_, index) => (
          <Skeleton
            key={`day-cell-skeleton-${index}`}
            variant="rounded"
            height={36}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    </>
  );
}
