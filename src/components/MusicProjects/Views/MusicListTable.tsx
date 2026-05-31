'use client';

import type { MusicCoverType } from '@/components/MusicProjects/MusicCoverImage';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import { useHoverSound } from '@/hooks/useHoverSound';
import {
  getMusicListTableContainerSx,
  getMusicListTableMainSx,
  getMusicListTableRowSx,
  getMusicListTableSubtitleSx,
  getMusicListTableTitleSx,
  getMusicListTableTrailingSx,
} from './musicListTableStyles';

export type MusicListTableRow = {
  id: string | number;
  coverImageUrl?: string | null;
  coverType: MusicCoverType;
  title: string;
  subtitle: string;
  trailing?: string;
  onClick: () => void;
};

type MusicListTableProps = {
  rows: MusicListTableRow[];
};

export function MusicListTable({ rows }: MusicListTableProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();

  return (
    <Box sx={getMusicListTableContainerSx()}>
      <TransitionGroup component={null}>
        {rows.map(row => (
          <Collapse key={row.id} timeout={300}>
            <Box
              onClick={row.onClick}
              onMouseEnter={playHoverSound}
              sx={getMusicListTableRowSx(theme)}
            >
              <MusicCoverImage
                imageUrl={row.coverImageUrl}
                type={row.coverType}
                size={48}
              />
              <Box sx={getMusicListTableMainSx()}>
                <MusicListItemCell title={row.title} subtitle={row.subtitle} />
              </Box>
              {row.trailing && (
                <Box sx={getMusicListTableTrailingSx()}>
                  <Typography variant="caption" color="text.secondary">
                    {row.trailing}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
}

type MusicListItemCellProps = {
  title: string;
  subtitle: string;
};

export function MusicListItemCell({ title, subtitle }: MusicListItemCellProps) {
  return (
    <>
      <Typography
        variant="body2"
        className="music-list-table-title"
        sx={getMusicListTableTitleSx()}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={getMusicListTableSubtitleSx()}
      >
        {subtitle}
      </Typography>
    </>
  );
}
