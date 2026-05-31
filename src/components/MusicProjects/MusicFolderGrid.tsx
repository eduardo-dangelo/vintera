'use client';

import type { ReactNode } from 'react';
import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import { Box, Collapse } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { getFolderGridSizes } from '@/utils/folderGridSizes';

export type MusicFolderGridItem = {
  id: string | number;
  content: ReactNode;
};

type MusicFolderGridProps = {
  cardSize: ListFolderCardSize;
  items: MusicFolderGridItem[];
};

export function MusicFolderGrid({ cardSize, items }: MusicFolderGridProps) {
  const gridSizes = getFolderGridSizes(cardSize);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
      <TransitionGroup component={null}>
        {items.map(item => (
          <Collapse
            key={item.id}
            timeout={300}
            sx={{
              '&.MuiCollapse-root': { display: 'contents !important' },
              '& > .MuiCollapse-wrapper': { display: 'contents !important' },
              '& > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner': {
                display: 'contents !important',
              },
            }}
          >
            <Box
              sx={{
                textDecoration: 'none',
                display: 'block',
                width: gridSizes,
                flexShrink: 0,
                p: 1,
              }}
            >
              {item.content}
            </Box>
          </Collapse>
        ))}
      </TransitionGroup>
    </Box>
  );
}
