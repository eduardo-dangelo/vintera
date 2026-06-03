'use client';

import type { ReactNode } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

type MusicStatBadgeProps = {
  count: number;
  label: string;
  compact?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
};

export function MusicStatBadge({
  count,
  label,
  compact = false,
  hideLabel = false,
  tooltip,
}: MusicStatBadgeProps) {
  const tooltipTitle = tooltip ?? `${count} ${label}`;

  const countChip = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: compact ? 20 : 24,
        height: compact ? 20 : 24,
        px: compact ? 0.75 : 1,
        borderRadius: '9999px',
        bgcolor: 'action.hover',
        color: 'text.secondary',
        fontSize: compact ? '0.65rem' : '0.7rem',
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {count}
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: hideLabel ? 0 : compact ? 0.5 : 0.75,
      }}
    >
      {hideLabel
        ? (
            <Tooltip title={tooltipTitle} placement="top" arrow>
              {countChip}
            </Tooltip>
          )
        : (
            countChip
          )}
      {!hideLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: compact ? '0.65rem' : undefined, lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

type MusicStatBadgeRowProps = {
  children: ReactNode;
  compact?: boolean;
  nowrap?: boolean;
};

export function MusicStatBadgeRow({
  children,
  compact = false,
  nowrap = false,
}: MusicStatBadgeRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: nowrap ? 'nowrap' : 'wrap',
        alignItems: 'center',
        flexShrink: nowrap ? 0 : undefined,
        gap: compact ? 1 : 1.5,
      }}
    >
      {children}
    </Box>
  );
}
