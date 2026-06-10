'use client';

import { Box, Skeleton } from '@mui/material';
import { MusicDetailHeaderSkeleton } from '@/components/MusicProjects/MusicDetailHeaderSkeleton';

type MusicEntityDetailPageSkeletonProps = {
  bodyVariant?: 'song' | 'album';
};

export function MusicEntityDetailPageSkeleton({
  bodyVariant = 'song',
}: MusicEntityDetailPageSkeletonProps) {
  return (
    <Box aria-busy="true" aria-label="Loading">
      <MusicDetailHeaderSkeleton />

      {bodyVariant === 'song'
        ? (
            <Box>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rounded" height={120} sx={{ borderRadius: 1, mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={88} height={36} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          )
        : (
            <Box>
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="85%" height={24} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 2 }} />
            </Box>
          )}
    </Box>
  );
}
