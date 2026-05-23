'use client';

import {
  AppBar,
  Button,
  Container,
  Stack,
  Toolbar,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Logo } from '../Logo';

export const Navigation = () => {
  const t = useTranslations('Index');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(139, 92, 246, 0.15)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
          <Logo variant="light" />

          <Stack direction="row" spacing={2}>
            <Button
              component={Link}
              href="/sign-in"
              sx={{
                'color': 'text.secondary',
                'fontWeight': 500,
                'textTransform': 'none',
                '&:hover': { color: 'text.primary' },
              }}
            >
              {t('nav_sign_in')}
            </Button>
            <Button
              component={Link}
              href="/sign-up"
              variant="contained"
              sx={{
                'borderRadius': 2,
                'px': 3,
                'py': 1,
                'fontSize': '0.875rem',
                'fontWeight': 600,
                'textTransform': 'none',
                'background': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                'boxShadow': '0 4px 24px rgba(139, 92, 246, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                },
              }}
            >
              {t('nav_get_started')}
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
