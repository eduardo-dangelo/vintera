'use client';

import { createTheme, CssBaseline, ThemeProvider as MUIThemeProvider } from '@mui/material';

const marketingTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
    text: {
      primary: '#f4f4f5',
      secondary: 'rgba(244, 244, 245, 0.7)',
    },
    primary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: 'var(--font-nunito), sans-serif',
    h1: { fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 600 },
  },
});

export function MarketingThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MUIThemeProvider theme={marketingTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
