import type { SxProps, Theme } from '@mui/material/styles';

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
    'display': 'flex',
    'alignItems': 'center',
    'gap': 2,
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

export function getMusicListTableMainSx(): SxProps<Theme> {
  return {
    flex: 1,
    minWidth: 0,
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

export function getMusicListTableTrailingSx(): SxProps<Theme> {
  return {
    display: { xs: 'none', sm: 'block' },
    flexShrink: 0,
  };
}
