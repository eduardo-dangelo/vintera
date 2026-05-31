'use client';

import {
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Breadcrumb } from './Breadcrumb';
import { useBreadcrumb } from './BreadcrumbContext';
import { useGlobalTopbarContent } from './GlobalTopbarContentContext';
import { TopbarActions } from './TopbarActions';

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
        backdropFilter: 'blur(2px)',
        bgcolor: theme => (theme.palette.mode === 'light'
          ? 'rgba(248, 249, 250, 0.85)'
          : 'rgba(37, 37, 38, 0.85)'),
        zIndex: theme.zIndex.appBar - 1,
        gap: 1,
        // border: '1px solid',
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

      {/* Actions - mobile only; desktop actions live in sidebar header */}
      {!rightContent && (
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', flexShrink: 0 }}>
          <TopbarActions />
        </Box>
      )}
    </Box>
  );
}
