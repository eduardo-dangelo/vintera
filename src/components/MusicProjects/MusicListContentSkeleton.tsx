'use client';

import type { ListFolderCardSize, ListViewMode } from '@/utils/listViewPrefs';
import { Box } from '@mui/material';
import { MusicFolderGridSkeleton } from './MusicFolderGridSkeleton';
import { MusicListTableSkeleton } from './Views/MusicListTableSkeleton';

type MusicListContentSkeletonProps = {
  viewMode: ListViewMode;
  cardSize?: ListFolderCardSize;
};

export function MusicListContentSkeleton({
  viewMode,
  cardSize = 'medium',
}: MusicListContentSkeletonProps) {
  return (
    <Box aria-busy="true" aria-label="Loading">
      {viewMode === 'list'
        ? <MusicListTableSkeleton />
        : <MusicFolderGridSkeleton cardSize={cardSize} />}
    </Box>
  );
}
