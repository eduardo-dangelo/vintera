'use client';

import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type AuthPageLayoutProps = {
  children: ReactNode;
};

export const AuthPageLayout = ({ children }: AuthPageLayoutProps) => {
  const t = useTranslations('AuthPage');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
          src="/assets/images/auth-background.jpg"
          alt={t('background_alt')}
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
              rgba(10, 10, 15, 0.6) 0%,
              rgba(10, 10, 15, 0.4) 50%,
              rgba(10, 10, 15, 0.65) 100%
            ),
            radial-gradient(
              ellipse 70% 60% at 50% 50%,
              rgba(139, 92, 246, 0.15),
              transparent
            )
          `,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
