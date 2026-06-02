'use client';

import {
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { globalTopbarGlassSx } from '@/utils/glassPaperStyles';
import { Breadcrumb } from './Breadcrumb';
import { useBreadcrumb } from './BreadcrumbContext';
import { useGlobalTopbarContent } from './GlobalTopbarContentContext';

export function GlobalTopbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Get breadcrumb items from context
  const { items: breadcrumbItems } = useBreadcrumb();

  // Get registered right content (e.g., AssetsTopBar controls on mobile)
  const { rightContent } = useGlobalTopbarContent();

  const isEmptyOnDesktop = !isMobile
    && breadcrumbItems.length === 0
    && !rightContent;

  if (isEmptyOnDesktop) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: isMobile ? 56 : 0, // Account for mobile AppBar height
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: { xs: 0, lg: 2 },
        ...globalTopbarGlassSx(theme),
        zIndex: theme.zIndex.appBar - 1,
        gap: 1,
      }}
    >
      {/* Breadcrumb - left side, can wrap below on small screens */}
      {breadcrumbItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            minWidth: 0, // Allow shrinking
            overflow: 'hidden',
            py: 1,
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
        </Box>
      )}

      {/* Registered right content (e.g., AssetsTopBar controls on mobile) */}
      {rightContent && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {rightContent}
        </Box>
      )}

    </Box>
  );
}
