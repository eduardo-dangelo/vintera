'use client';

import type { ReactNode } from 'react';
import type { ListFolderCardSize, ListViewMode } from '@/utils/listViewPrefs';
import { Box, useTheme } from '@mui/material';
import { CollapsibleSearch } from '@/components/common/CollapsibleSearch';
import { ListViewControls } from '@/components/common/ListViewControls';
import { MusicListProjectFilter } from './MusicListProjectFilter';
import { getToolbarIconButtonSx } from './musicListToolbarStyles';

type MusicListToolbarProps = {
  viewMode: ListViewMode;
  cardSize: ListFolderCardSize;
  onViewModeChange: (mode: ListViewMode) => void;
  onCardSizeChange: (size: ListFolderCardSize) => void;
  showViewControls?: boolean;
  locale?: string;
  selectedProjectIds?: number[];
  onSelectedProjectIdsChange?: (ids: number[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  newButton: ReactNode;
};

export function MusicListToolbar({
  viewMode,
  cardSize,
  onViewModeChange,
  onCardSizeChange,
  showViewControls = true,
  locale,
  selectedProjectIds,
  onSelectedProjectIdsChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search',
  newButton,
}: MusicListToolbarProps) {
  const theme = useTheme();
  const iconButtonSx = getToolbarIconButtonSx(theme);
  const showProjectFilter = locale != null
    && selectedProjectIds != null
    && onSelectedProjectIdsChange != null;

  return (
    <Box
      sx={{
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'flex-end',
        'gap': { xs: 0.75, sm: 1 },
        'flexWrap': 'nowrap',
        'minWidth': 0,
        '& .MuiButton-root': {
          minHeight: { xs: 30, sm: 34 },
          py: { xs: 0.375, sm: 0.5 },
          px: { xs: 1.25, sm: 1.5 },
          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          whiteSpace: 'nowrap',
        },
        '& .MuiButton-startIcon > *:nth-of-type(1)': {
          fontSize: { xs: 16, sm: 18 },
        },
      }}
    >
      {showViewControls && (
        <>
          <ListViewControls
            viewMode={viewMode}
            cardSize={cardSize}
            onViewModeChange={onViewModeChange}
            onCardSizeChange={onCardSizeChange}
          />
          <Box
            sx={{
              height: 20,
              bgcolor: 'grey.300',
              mx: 0.5,
            }}
          />
        </>
      )}
      {showProjectFilter && (
        <MusicListProjectFilter
          locale={locale}
          selectedProjectIds={selectedProjectIds}
          onSelectedProjectIdsChange={onSelectedProjectIdsChange}
          iconButtonSx={iconButtonSx as object}
        />
      )}
      <CollapsibleSearch
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        iconButtonSx={iconButtonSx as object}
      />
      {newButton}
    </Box>
  );
}
