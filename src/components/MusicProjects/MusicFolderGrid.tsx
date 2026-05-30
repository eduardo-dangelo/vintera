'use client';

import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import { Box } from '@mui/material';
import { Children } from 'react';
import { getFolderGridSizes } from '@/utils/folderGridSizes';

type MusicFolderGridProps = {
  cardSize: ListFolderCardSize;
  children: React.ReactNode;
};

export function MusicFolderGrid({ cardSize, children }: MusicFolderGridProps) {
  const gridSizes = getFolderGridSizes(cardSize);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      {Children.toArray(children).map((child, index) => (
        <Box
          key={(child as React.ReactElement).key ?? index}
          sx={{
            textDecoration: 'none',
            display: 'block',
            width: gridSizes,
            p: 1,
          }}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
}
