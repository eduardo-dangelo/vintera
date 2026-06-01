'use client';

import type { ReactNode } from 'react';
import type { MusicCoverType } from '@/components/MusicProjects/MusicCoverImage';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { MUSIC_LIST_COVER_SIZE } from '@/components/MusicProjects/musicCardStyles';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import { useHoverSound } from '@/hooks/useHoverSound';
import {
  getMusicListTableContainerSx,
  getMusicListTableMainSx,
  getMusicListTableMetaSx,
  getMusicListTableRowSx,
  getMusicListTableStatSx,
  getMusicListTableSubtitleSx,
  getMusicListTableTitleSx,
  getMusicListTableTrailingSx,
} from './musicListTableStyles';

export type MusicListTableRow = {
  id: string | number;
  coverImageUrl?: string | null;
  coverType: MusicCoverType;
  title: string;
  subtitle: string | ReactNode;
  statPrimary?: ReactNode;
  statSecondary?: ReactNode;
  meta?: ReactNode;
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
                size={MUSIC_LIST_COVER_SIZE}
              />
              <Box sx={getMusicListTableMainSx()}>
                <MusicListItemCell title={row.title} subtitle={row.subtitle} />
              </Box>
              <Box sx={getMusicListTableStatSx()}>
                {row.statPrimary}
              </Box>
              <Box sx={getMusicListTableStatSx()}>
                {row.statSecondary}
              </Box>
              <Box sx={getMusicListTableMetaSx()}>
                {row.meta}
              </Box>
              <Box sx={getMusicListTableTrailingSx()}>
                {row.trailing && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {row.trailing}
                  </Typography>
                )}
              </Box>
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
}

type MusicListItemCellProps = {
  title: string;
  subtitle: string | ReactNode;
};

export function MusicListItemCell({ title, subtitle }: MusicListItemCellProps) {
  const subtitleIsString = typeof subtitle === 'string';

  return (
    <>
      <Typography
        variant="body2"
        className="music-list-table-title"
        sx={getMusicListTableTitleSx()}
      >
        {title}
      </Typography>
      {subtitleIsString
        ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={getMusicListTableSubtitleSx()}
            >
              {subtitle}
            </Typography>
          )
        : (
            <Box sx={getMusicListTableSubtitleSx()}>{subtitle}</Box>
          )}
    </>
  );
}
