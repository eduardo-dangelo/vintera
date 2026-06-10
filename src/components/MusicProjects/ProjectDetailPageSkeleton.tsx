'use client';

import {
  Box,
  Divider,
  Grid,
  Skeleton,
  useTheme,
} from '@mui/material';
import { MusicDetailHeaderSkeleton } from '@/components/MusicProjects/MusicDetailHeaderSkeleton';
import { ProjectDetailCalendarSkeleton } from '@/components/MusicProjects/ProjectDetailCalendarSkeleton';
import { OVERVIEW_PREVIEW_LIMIT } from '@/components/MusicProjects/tabs/projectTabVisibility';
import { MusicListTableSkeleton } from '@/components/MusicProjects/Views/MusicListTableSkeleton';

const TAB_SKELETON_WIDTHS = [88, 64, 72] as const;
const MEMBER_AVATAR_COUNT = 4;
const EXTERNAL_LINK_ROW_COUNT = 2;

function ProjectDetailSidebarSkeleton() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: 24,
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(160deg, ${theme.palette.action.hover} 0%, transparent 60%)`,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="text" width="100%" height={18} />
        <Skeleton variant="text" width="92%" height={18} sx={{ mt: 0.75 }} />
        <Skeleton variant="text" width="75%" height={18} sx={{ mt: 0.75 }} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Skeleton variant="text" width={100} height={28} sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {Array.from({ length: MEMBER_AVATAR_COUNT }, (_, index) => (
            <Skeleton
              key={`member-skeleton-${index}`}
              variant="circular"
              width={36}
              height={36}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Skeleton variant="text" width={90} height={28} sx={{ mb: 1.5 }} />
        <ProjectDetailCalendarSkeleton viewMode="calendar" />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2 }} />
        <Skeleton variant="text" width={130} height={28} sx={{ mb: 1.5 }} />
        {Array.from({ length: EXTERNAL_LINK_ROW_COUNT }, (_, index) => (
          <Skeleton
            key={`link-skeleton-${index}`}
            variant="rounded"
            height={40}
            sx={{ borderRadius: 1, mb: index < EXTERNAL_LINK_ROW_COUNT - 1 ? 1 : 0 }}
          />
        ))}
      </Box>
    </Box>
  );
}

function ProjectDetailMainContentSkeleton() {
  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, pb: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 3, px: 0.5 }}>
          {TAB_SKELETON_WIDTHS.map((width, index) => (
            <Skeleton
              key={`tab-skeleton-${index}`}
              variant="text"
              width={width}
              height={32}
            />
          ))}
        </Box>
      </Box>

      {Array.from({ length: 2 }, (_, sectionIndex) => (
        <Box key={`section-skeleton-${sectionIndex}`} sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width={140} height={28} />
            <Skeleton variant="text" width={64} height={24} />
          </Box>
          <MusicListTableSkeleton rowCount={OVERVIEW_PREVIEW_LIMIT} />
        </Box>
      ))}
    </Box>
  );
}

export function ProjectDetailPageSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading">
      <MusicDetailHeaderSkeleton />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProjectDetailSidebarSkeleton />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ProjectDetailMainContentSkeleton />
        </Grid>
      </Grid>
    </Box>
  );
}
