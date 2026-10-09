import type { Theme } from '@mui/material/styles';

/** Thin Notion-like scrollbar: capsule thumb, transparent track. */
export function discreetScrollbarStyles(options?: {
  /** Use light-on-dark thumb (sidebar). Default: auto from theme mode. */
  onDarkSurface?: boolean;
}): (theme: Theme) => Record<string, unknown> {
  return (theme) => {
    const dark = options?.onDarkSurface ?? theme.palette.mode === 'dark';
    const thumb = dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)';
    const thumbHover = dark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.28)';

    return {
      'scrollbarWidth': 'thin',
      'scrollbarColor': `${thumb} transparent`,
      '&::-webkit-scrollbar': {
        width: 6,
        height: 6,
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        'backgroundColor': thumb,
        'borderRadius': 999,
        '&:hover': {
          backgroundColor: thumbHover,
        },
      },
    };
  };
}

/** Apply the discreet scrollbar to every element. WebKit pseudos do not inherit. */
export function getMuiDiscreetScrollbarOverrides() {
  return {
    MuiCssBaseline: {
      styleOverrides: (theme: Theme) => ({
        '*': discreetScrollbarStyles()(theme),
      }),
    },
  };
}
