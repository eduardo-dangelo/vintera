'use client';

import type { Theme } from '@mui/material/styles';
import type { MouseEvent, ReactNode } from 'react';
import type { MusicCoverType } from '@/components/MusicProjects/MusicCoverImage';
import type { MusicItemMenuTarget } from '@/components/MusicProjects/musicItemMenuTypes';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
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
import {
  MUSIC_LIST_ROW_ESTIMATE_PX,
  MUSIC_LIST_VIRTUAL_OVERSCAN,
  MUSIC_LIST_VIRTUALIZATION_THRESHOLD,
  shouldVirtualizeMusicList,
} from './musicListVirtualizationConfig';

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
  virtualizationThreshold?: number;
};

export function MusicListTable({
  locale,
  rows,
  virtualizationThreshold = MUSIC_LIST_VIRTUALIZATION_THRESHOLD,
}: MusicListTableProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const { openFromButton, openFromContextMenu, renderMenus } = useMusicItemContextMenu(locale);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const shouldVirtualize = shouldVirtualizeMusicList(rows.length, virtualizationThreshold);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => MUSIC_LIST_ROW_ESTIMATE_PX,
    overscan: MUSIC_LIST_VIRTUAL_OVERSCAN,
    enabled: shouldVirtualize,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const rowIndexById = useMemo(
    () => new Map(rows.map((row, index) => [row.id, index])),
    [rows],
  );

  return (
    <>
      <Box
        ref={parentRef}
        sx={{
          ...getMusicListTableContainerSx(),
          ...(shouldVirtualize
            ? {
                maxHeight: 'min(70vh, 960px)',
                overflow: 'auto',
              }
            : {}),
        }}
      >
        {shouldVirtualize
          ? (
              <Box sx={{ height: `${totalSize}px`, position: 'relative' }}>
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  if (!row) {
                    return null;
                  }
                  const rowIndex = virtualRow.index;
                  const showDivider = rowIndex < rows.length - 1;
                  return (
                    <Box
                      key={row.id}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <MusicListTableRowItem
                        row={row}
                        theme={theme}
                        showDivider={showDivider}
                        onMouseEnter={playHoverSound}
                        onOpenContextMenu={openFromContextMenu}
                        onOpenActions={openFromButton}
                      />
                    </Box>
                  );
                })}
              </Box>
            )
          : (
              <TransitionGroup component={null}>
                {rows.map((row) => {
                  const rowIndex = rowIndexById.get(row.id) ?? 0;
                  const showDivider = rowIndex < rows.length - 1;
                  return (
                    <Collapse key={row.id} timeout={300}>
                      <MusicListTableRowItem
                        row={row}
                        theme={theme}
                        showDivider={showDivider}
                        onMouseEnter={playHoverSound}
                        onOpenContextMenu={openFromContextMenu}
                        onOpenActions={openFromButton}
                      />
                    </Collapse>
                  );
                })}
              </TransitionGroup>
            )}
      </Box>
      {renderMenus()}
    </>
  );
}

type MusicListTableRowItemProps = {
  row: MusicListTableRow;
  theme: Theme;
  showDivider: boolean;
  onMouseEnter: () => void;
  onOpenContextMenu: (event: MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => void;
  onOpenActions: (event: MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => void;
};

function MusicListTableRowItem({
  row,
  theme,
  showDivider,
  onMouseEnter,
  onOpenContextMenu,
  onOpenActions,
}: MusicListTableRowItemProps) {
  return (
    <Box
      className="music-list-table-row"
      onClick={row.onClick}
      onMouseEnter={onMouseEnter}
      onContextMenu={
        row.menuTarget
          ? e => onOpenContextMenu(e, row.menuTarget!)
          : undefined
      }
      sx={getMusicListTableRowSx(theme, { showDivider })}
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
            onOpen={onOpenActions}
          />
        </Box>
      )}
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
