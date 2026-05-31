'use client';

import type { ReactNode } from 'react';
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  getHeroBackgroundSx,
  getHeroOverlaySx,
  getHeroRootSx,
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
      <Box sx={getHeroOverlaySx(theme)} />
      <Box ref={sentinelRef} sx={{ height: 1, flexShrink: 0 }} />
      <Box sx={getStickyBarSx(theme, isMobile, isStuck)}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, minWidth: 0 }}>
          {title}
        </Typography>
        {toolbar && (
          <Box sx={{ flexShrink: 0 }}>
            {toolbar}
          </Box>
        )}
      </Box>
    </Box>
  );
}
