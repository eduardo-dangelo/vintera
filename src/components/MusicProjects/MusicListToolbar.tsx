'use client';

import type { ReactNode } from 'react';
import type { ListFolderCardSize, ListViewMode } from '@/utils/listViewPrefs';
import { Box, useTheme } from '@mui/material';
import { CollapsibleSearch } from '@/components/common/CollapsibleSearch';
import { ListViewControls } from '@/components/common/ListViewControls';
import { getToolbarIconButtonSx } from './musicListToolbarStyles';

type MusicListToolbarProps = {
  viewMode: ListViewMode;
  cardSize: ListFolderCardSize;
  onViewModeChange: (mode: ListViewMode) => void;
  onCardSizeChange: (size: ListFolderCardSize) => void;
  showViewControls?: boolean;
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
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search',
  newButton,
}: MusicListToolbarProps) {
  const theme = useTheme();
  const iconButtonSx = getToolbarIconButtonSx(theme);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
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
