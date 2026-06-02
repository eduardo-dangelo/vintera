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
const TITLE_COLOR_EARLY_SWITCH_PX = 28;

export function MusicListPageHeader({ title, toolbar, heroImageSrc }: MusicListPageHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [isStuck, setIsStuck] = useState(false);
  const [isHeroOutOfView, setIsHeroOutOfView] = useState(!heroImageSrc);
  const [isHeroTextOutOfView, setIsHeroTextOutOfView] = useState(!heroImageSrc);
  const heroBandRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const useCompactHeader = isMobile || isStuck;
  const hasHeroImage = Boolean(heroImageSrc);

  const topOffset = isMobile ? 56 : 0;

  useEffect(() => {
    const heroBand = heroBandRef.current;
    const stickyBar = stickyBarRef.current;
    if (!stickyBar) {
      return undefined;
    }

    const scrollRoot = stickyBar.closest('main');

    const updateHeaderState = () => {
      const { top } = stickyBar.getBoundingClientRect();
      setIsStuck(top <= topOffset + 0.5);

      if (!hasHeroImage || !heroBand) {
        setIsHeroOutOfView(true);
        setIsHeroTextOutOfView(true);
        return;
      }

      const heroBottom = heroBand.getBoundingClientRect().bottom;
      setIsHeroOutOfView(heroBottom <= topOffset + 0.5);
      setIsHeroTextOutOfView(heroBottom <= topOffset + TITLE_COLOR_EARLY_SWITCH_PX);
    };

    const initialUpdateFrame = window.requestAnimationFrame(updateHeaderState);
    scrollRoot?.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState);

    return () => {
      window.cancelAnimationFrame(initialUpdateFrame);
      scrollRoot?.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', updateHeaderState);
    };
  }, [hasHeroImage, topOffset]);

  const heroDarkTheme = useMemo(() => createHeroDarkTheme(theme), [theme]);
  const useHeroBarTheme = hasHeroImage && !(theme.palette.mode === 'light' && isHeroTextOutOfView);
  const showStickyGlass = hasHeroImage ? isHeroOutOfView : isStuck;
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
      <Box ref={heroBandRef} sx={getHeroBandSx()}>
        <Box sx={getHeroBackgroundSx(theme)}>
          {renderHeroImage()}
        </Box>
        <Box sx={getHeroOverlaySx(theme, hasHeroImage)} />
      </Box>

      <Box ref={stickyBarRef} sx={getStickyBarSx(theme, isMobile, showStickyGlass)}>
        <Box sx={getStickyBarContentSx(isStuck)}>
          <ThemeProvider theme={barTheme}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: useCompactHeader ? 1.5 : 2,
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                width: '100%',
                minWidth: 0,
              }}
            >
              <Typography
                variant={useCompactHeader ? 'h5' : 'h4'}
                component="h1"
                color="text.primary"
                sx={getHeroTitleSx(hasHeroImage, useCompactHeader, isHeroTextOutOfView, theme)}
              >
                {title}
              </Typography>
              {toolbar && (
                <Box sx={getHeroToolbarWrapperSx(hasHeroImage, useCompactHeader, isHeroTextOutOfView, theme)}>
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
