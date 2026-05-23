'use client';

import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export const Hero = () => {
  const t = useTranslations('Index');

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        minHeight: { xs: '85vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/assets/images/landing-hero.jpg"
          alt={t('hero_image_alt')}
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            linear-gradient(
              to bottom,
              rgba(10, 10, 15, 0.55) 0%,
              rgba(10, 10, 15, 0.35) 45%,
              rgba(10, 10, 15, 0.75) 100%
            ),
            radial-gradient(
              ellipse 80% 50% at 50% 20%,
              rgba(139, 92, 246, 0.2),
              transparent
            )
          `,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 12, md: 16 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.light',
              letterSpacing: 3,
              fontWeight: 600,
              mb: 2,
              display: 'block',
            }}
          >
            {t('hero_eyebrow')}
          </Typography>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.75rem', md: '4.25rem' },
              fontWeight: 700,
              lineHeight: 1.05,
              mb: 3,
              background: 'linear-gradient(135deg, #f4f4f5 0%, #a78bfa 50%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('hero_title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1.125rem', md: '1.35rem' },
              color: 'rgba(244, 244, 245, 0.85)',
              mb: 5,
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            {t('hero_subtitle')}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              href="/sign-up"
              variant="contained"
              size="large"
              sx={{
                'borderRadius': 2,
                'px': 4,
                'py': 1.5,
                'fontWeight': 600,
                'textTransform': 'none',
                'fontSize': '1rem',
                'background': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                'boxShadow': '0 8px 32px rgba(139, 92, 246, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                },
              }}
            >
              {t('hero_cta_primary')}
            </Button>
            <Button
              component={Link}
              href="/sign-in"
              variant="outlined"
              size="large"
              sx={{
                'borderRadius': 2,
                'px': 4,
                'py': 1.5,
                'fontWeight': 600,
                'textTransform': 'none',
                'fontSize': '1rem',
                'borderColor': 'rgba(255, 255, 255, 0.4)',
                'color': '#f4f4f5',
                'bgcolor': 'rgba(10, 10, 15, 0.35)',
                'backdropFilter': 'blur(8px)',
                '&:hover': {
                  borderColor: 'primary.light',
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                },
              }}
            >
              {t('hero_cta_secondary')}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};
