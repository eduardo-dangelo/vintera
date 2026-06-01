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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  createHeroDarkTheme,
  getHeroBackgroundSx,
  getHeroBandSx,
  getHeroOverlaySx,
  getHeroTitleSx,
  getHeroToolbarWrapperSx,
  getStickyBarContentSx,
  getStickyBarSx,
} from './musicListPageHeaderStyles';

type MusicListPageHeaderProps = {
  title: string;
  toolbar?: ReactNode;
  heroImageSrc?: string;
};

const heroImageStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center',
};

export function MusicListPageHeader({ title, toolbar, heroImageSrc }: MusicListPageHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [isStuck, setIsStuck] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  const topOffset = isMobile ? 56 : 0;

  useEffect(() => {
    const stickyBar = stickyBarRef.current;
    if (!stickyBar) {
      return undefined;
    }

    const scrollRoot = stickyBar.closest('main');

    const updateStuck = () => {
      const { top } = stickyBar.getBoundingClientRect();
      setIsStuck(top <= topOffset + 0.5);
    };

    updateStuck();
    scrollRoot?.addEventListener('scroll', updateStuck, { passive: true });
    window.addEventListener('resize', updateStuck);

    return () => {
      scrollRoot?.removeEventListener('scroll', updateStuck);
      window.removeEventListener('resize', updateStuck);
    };
  }, [topOffset]);

  const hasHeroImage = Boolean(heroImageSrc);
  const heroDarkTheme = useMemo(() => createHeroDarkTheme(theme), [theme]);
  const useHeroBarTheme = hasHeroImage && !(theme.palette.mode === 'light' && isStuck);
  const barTheme = useHeroBarTheme ? heroDarkTheme : theme;

  const renderHeroImage = () => (
    heroImageSrc
      ? (
          <Image
            src={heroImageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            style={heroImageStyle}
          />
        )
      : null
  );

  return (
    <Fragment>
      <Box sx={getHeroBandSx()}>
        <Box sx={getHeroBackgroundSx(theme)}>
          {renderHeroImage()}
        </Box>
        <Box sx={getHeroOverlaySx(theme, hasHeroImage)} />
      </Box>

      <Box ref={stickyBarRef} sx={getStickyBarSx(theme, isMobile, isStuck)}>
        <Box sx={getStickyBarContentSx(isStuck)}>
          <ThemeProvider theme={barTheme}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: isStuck ? 1.5 : 2,
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <Typography
                variant={isStuck ? 'h5' : 'h4'}
                component="h1"
                color="text.primary"
                sx={getHeroTitleSx(hasHeroImage, isStuck, theme)}
              >
                {title}
              </Typography>
              {toolbar && (
                <Box sx={getHeroToolbarWrapperSx(hasHeroImage, isStuck, theme)}>
                  {toolbar}
                </Box>
              )}
            </Box>
          </ThemeProvider>
        </Box>
      </Box>
    </Fragment>
  );
}
