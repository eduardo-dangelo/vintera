'use client';

import {
  Box,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  getHeroBandSx,
  getStickyBarSx,
} from '@/components/MusicProjects/musicListPageHeaderStyles';
import {
  getProjectDetailActionsSx,
  getProjectDetailBreadcrumbWrapperSx,
  getProjectDetailLeftGroupSx,
  getProjectDetailLogoAbsoluteSx,
  getProjectDetailLogoSpacerSx,
  getProjectDetailMainRowSx,
  getProjectDetailStickyBarContentSx,
  getProjectDetailTitleGroupSx,
  PROJECT_DETAIL_LOGO_SIZE,
} from '@/components/MusicProjects/projectDetailPageHeaderStyles';

export function MusicDetailHeaderSkeleton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Box sx={getHeroBandSx()}>
        <Skeleton
          variant="rectangular"
          sx={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}
        />
        <Box sx={getProjectDetailBreadcrumbWrapperSx()}>
          <Skeleton variant="rounded" width={140} height={20} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      <Box sx={getStickyBarSx(theme, isMobile, false)}>
        <Box sx={getProjectDetailStickyBarContentSx(false)}>
          <Box sx={getProjectDetailMainRowSx(false)}>
            <Box sx={getProjectDetailLeftGroupSx()}>
              <Box sx={getProjectDetailLogoSpacerSx(false, isMobile)} aria-hidden />
              <Box sx={getProjectDetailLogoAbsoluteSx()}>
                <Skeleton
                  variant="rounded"
                  width={PROJECT_DETAIL_LOGO_SIZE}
                  height={PROJECT_DETAIL_LOGO_SIZE}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
              <Box sx={getProjectDetailTitleGroupSx()}>
                <Skeleton
                  variant="text"
                  sx={{
                    width: { xs: 180, sm: 280 },
                    height: { xs: '1.875rem', sm: '2.65rem' },
                    fontSize: { xs: '1.5rem', sm: '2.125rem' },
                  }}
                />
              </Box>
            </Box>

            <Box sx={getProjectDetailActionsSx()}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
                <Skeleton variant="rounded" width={56} height={28} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={64} height={28} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
