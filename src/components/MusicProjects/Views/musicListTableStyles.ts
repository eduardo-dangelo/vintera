import type { SxProps, Theme } from '@mui/material/styles';
import { MUSIC_LIST_COVER_SIZE } from '@/components/MusicProjects/musicCardStyles';

export function getMusicListTableContainerSx(): SxProps<Theme> {
  return {
    bgcolor: 'background.paper',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  };
}

export function getMusicListTableRowSx(theme: Theme): SxProps<Theme> {
  return {
    'display': 'grid',
    'gridTemplateColumns': `${MUSIC_LIST_COVER_SIZE}px repeat(5, minmax(0, 1fr))`,
    'columnGap': 2,
    'alignItems': 'center',
    'py': 1,
    'px': 1.5,
    'cursor': 'pointer',
    'transition': 'background-color 0.15s ease, color 0.15s ease',
    'borderBottom': '1px solid',
    'borderColor': 'divider',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      'bgcolor': 'action.selected',
      '& .music-list-table-title': {
        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
      },
    },
  };
}

export function getMusicListTableColumnSx(
  align: 'start' | 'center' | 'end' = 'start',
): SxProps<Theme> {
  return {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: align === 'start' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end',
  };
}

export function getMusicListTableMainSx(): SxProps<Theme> {
  return {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  };
}

export function getMusicListTableTitleSx(): SxProps<Theme> {
  return {
    fontWeight: 600,
    transition: 'color 0.15s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

export function getMusicListTableSubtitleSx(): SxProps<Theme> {
  return {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    mt: 0.25,
  };
}

export function getMusicListTableStatSx(): SxProps<Theme> {
  return getMusicListTableColumnSx('start');
}

export function getMusicListTableMetaSx(): SxProps<Theme> {
  return getMusicListTableColumnSx('center');
}

export function getMusicListTableTrailingSx(): SxProps<Theme> {
  return {
    ...getMusicListTableColumnSx('end'),
    display: { xs: 'none', sm: 'flex' },
  };
}
