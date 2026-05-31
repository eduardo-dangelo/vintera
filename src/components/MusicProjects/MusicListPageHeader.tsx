'use client';

import type { ReactNode } from 'react';
import {
  Box,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createHeroDarkTheme,
  getHeroBackgroundSx,
  getHeroOverlaySx,
  getHeroRootSx,
  getHeroTitleSx,
  getHeroToolbarWrapperSx,
  getStickyBarSx,
} from './musicListPageHeaderStyles';

type MusicListPageHeaderProps = {
  title: string;
  toolbar?: ReactNode;
  heroImageSrc?: string;
};

export function MusicListPageHeader({ title, toolbar, heroImageSrc }: MusicListPageHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry?.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasHeroImage = Boolean(heroImageSrc);
  const heroDarkTheme = useMemo(() => createHeroDarkTheme(theme), [theme]);
  const barTheme = isStuck ? theme : heroDarkTheme;

  return (
    <Box sx={getHeroRootSx()}>
      <Box sx={getHeroBackgroundSx(theme)}>
        {heroImageSrc && (
          <Image
            src={heroImageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}
      </Box>
      <Box sx={getHeroOverlaySx(theme, hasHeroImage)} />
      <Box ref={sentinelRef} sx={{ height: 1, flexShrink: 0 }} />
      <Box sx={getStickyBarSx(theme, isMobile, isStuck)}>
        <ThemeProvider theme={barTheme}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              color={isStuck ? undefined : 'text.primary'}
              sx={getHeroTitleSx(hasHeroImage, isStuck)}
            >
              {title}
            </Typography>
            {toolbar && (
              <Box sx={getHeroToolbarWrapperSx(isStuck)}>
                {toolbar}
              </Box>
            )}
          </Box>
        </ThemeProvider>
      </Box>
    </Box>
  );
}
