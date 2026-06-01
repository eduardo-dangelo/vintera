'use client';

import type { ReactNode } from 'react';
import type { MusicCoverType } from '@/components/MusicProjects/MusicCoverImage';
import type { MusicItemMenuTarget } from '@/components/MusicProjects/musicItemMenuTypes';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { MUSIC_LIST_COVER_SIZE } from '@/components/MusicProjects/musicCardStyles';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import { MusicItemActionsButton } from '@/components/MusicProjects/MusicItemActionsButton';
import { useMusicItemContextMenu } from '@/components/MusicProjects/useMusicItemContextMenu';
import { useHoverSound } from '@/hooks/useHoverSound';
import {
  getMusicListTableActionsSx,
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
  menuTarget?: MusicItemMenuTarget;
  onClick: () => void;
};

type MusicListTableProps = {
  locale: string;
  rows: MusicListTableRow[];
};

export function MusicListTable({ locale, rows }: MusicListTableProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const { openFromButton, openFromContextMenu, renderMenus } = useMusicItemContextMenu(locale);

  return (
    <>
      <Box sx={getMusicListTableContainerSx()}>
        <TransitionGroup component={null}>
          {rows.map(row => (
            <Collapse key={row.id} timeout={300}>
              <Box
                className="music-list-table-row"
                onClick={row.onClick}
                onMouseEnter={playHoverSound}
                onContextMenu={
                  row.menuTarget
                    ? e => openFromContextMenu(e, row.menuTarget!)
                    : undefined
                }
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
                {row.menuTarget && (
                  <Box sx={getMusicListTableActionsSx()}>
                    <MusicItemActionsButton
                      target={row.menuTarget}
                      onOpen={openFromButton}
                    />
                  </Box>
                )}
              </Box>
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>
      {renderMenus()}
    </>
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
