'use client';

import { Box, Skeleton } from '@mui/material';

const SECTION_COUNT = 3;
const ROW_COUNT = 5;
const SKELETON_BG = 'rgba(255, 255, 255, 0.12)';

function SidebarSectionSkeleton({ sectionIndex }: { sectionIndex: number }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0.5,
          mb: 0.5,
          minHeight: 20,
        }}
      >
        <Skeleton
          variant="rounded"
          width={56 + sectionIndex * 8}
          height={12}
          sx={{ bgcolor: SKELETON_BG, borderRadius: 0.5 }}
        />
        <Skeleton
          variant="rounded"
          width={16}
          height={16}
          sx={{ bgcolor: SKELETON_BG, borderRadius: 0.5 }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
          <Box
            key={`sidebar-skeleton-${sectionIndex}-row-${rowIndex}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              pl: 1,
              pr: 1,
              py: 0.25,
              minHeight: 28,
            }}
          >
            <Skeleton
              variant="rounded"
              width={16}
              height={16}
              sx={{ bgcolor: SKELETON_BG, borderRadius: 0.5, flexShrink: 0 }}
            />
            <Skeleton
              variant="rounded"
              width={`${55 + ((rowIndex * 13) % 30)}%`}
              height={12}
              sx={{ bgcolor: SKELETON_BG, borderRadius: 0.5 }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function SidebarRecentsSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading">
      {Array.from({ length: SECTION_COUNT }, (_, sectionIndex) => (
        <SidebarSectionSkeleton key={`sidebar-skeleton-section-${sectionIndex}`} sectionIndex={sectionIndex} />
      ))}
    </Box>
  );
}
