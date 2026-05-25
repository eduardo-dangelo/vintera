'use client';

import { createTheme, CssBaseline, ThemeProvider as MUIThemeProvider } from '@mui/material';
import { usePathname } from 'next/navigation';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { useGetUserPreferences, useUpdateUserPreferences } from '@/queries/hooks/users';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveThemeMode(theme: string | undefined): ThemeMode {
  if (theme === 'dark') {
    return 'dark';
  }
  if (theme === 'light') {
    return 'light';
  }
  if (theme === 'system') {
    return 'light';
  }
  return 'light';
}

function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const fromDataset = document.documentElement.dataset.theme;
  if (fromDataset === 'light' || fromDataset === 'dark') {
    return fromDataset;
  }
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
  localStorage.setItem('theme', mode);
}

export function useThemeMode() {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname?.match(/^\/([a-z]{2})\//)?.[1] || 'en';

  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme() ?? 'light');
  const [themeReady, setThemeReady] = useState(false);

  const { data: preferences, isFetched } = useGetUserPreferences(locale);
  const updateUserPreferences = useUpdateUserPreferences(locale);

  useEffect(() => {
    if (!isFetched) {
      return;
    }
    const resolved = preferences?.theme
      ? resolveThemeMode(preferences.theme)
      : (getStoredTheme() ?? 'light');
    setMode(resolved);
    applyThemeToDocument(resolved);
    setThemeReady(true);
  }, [isFetched, preferences?.theme]);

  const persistTheme = useCallback(async (newMode: ThemeMode) => {
    setMode(newMode);
    applyThemeToDocument(newMode);
    try {
      await updateUserPreferences.mutateAsync({ theme: newMode });
    } catch {
      // Theme already applied locally; API may fail when unauthenticated
    }
  }, [updateUserPreferences]);

  const toggleTheme = useCallback(async () => {
    await persistTheme(mode === 'light' ? 'dark' : 'light');
  }, [mode, persistTheme]);

  const setTheme = useCallback(async (newMode: ThemeMode) => {
    await persistTheme(newMode);
  }, [persistTheme]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                background: {
                  default: '#f8f9fa',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1a1a1a',
                  secondary: '#666666',
                },
                action: {
                  hover: 'rgba(0, 0, 0, 0.04)',
                  selected: 'rgba(0, 0, 0, 0.08)',
                },
                primary: {
                  main: '#60a5fa',
                  light: '#93c5fd',
                  dark: '#3b82f6',
                  contrastText: '#ffffff',
                },
              }
            : {
                background: {
                  default: '#252526',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#cccccc',
                  secondary: 'rgba(204, 204, 204, 0.7)',
                },
                action: {
                  hover: 'rgba(255, 255, 255, 0.08)',
                  selected: 'rgba(255, 255, 255, 0.12)',
                },
                primary: {
                  main: '#60a5fa',
                  light: '#93c5fd',
                  dark: '#3b82f6',
                  contrastText: '#ffffff',
                },
              }),
          sidebar: {
            background: '#120e1c',
            textPrimary: '#f4f4f5',
            textSecondary: 'rgba(244, 244, 245, 0.65)',
          },
        },
      }),
    [mode],
  );

  const themeContextValue = useMemo(() => ({
    mode,
    toggleTheme,
    setTheme,
  }), [mode, toggleTheme, setTheme]);

  const placeholderBg = mode === 'light' ? '#f8f9fa' : '#252526';

  if (!themeReady) {
    return (
      <div style={{ backgroundColor: placeholderBg, minHeight: '100vh' }} />
    );
  }

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeContext value={themeContextValue}>
        {children}
      </ThemeContext>
    </MUIThemeProvider>
  );
}
